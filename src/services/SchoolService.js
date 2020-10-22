import util from 'util';
import rp from 'request-promise';
import { getTeamsWithNoSchool } from '../db/queries';

export default class SchoolService {
	constructor(connection) {
        this.connection = connection;
        this.query = util.promisify(connection.query).bind(connection);
    }

    async searchUniversityListByCountries(countries) {
        var universities = [];

        for (var country of countries) {
            universities.push(await rp({
                uri: `http://universities.hipolabs.com/search?name=&country=${country}`,
                json: true
            }));	
        }

        return universities;
    }

    async save(school) {
        try {
            await this.query("START TRANSACTION");
            var schoolInDB = await this._schoolInDB(school.full_name);

            if (schoolInDB)
                throw `School ${school.full_name} already in database`;
            			
            await this._saveSchool(school);
            await this.query("COMMIT");
        } catch (err) {
            await this.query("ROLLBACK");
            console.log("rolled back transaction");
            throw err;
        }
    }

    async _schoolInDB(fullName) {
        const existsResult = await this.query('SELECT id FROM school WHERE full_name = ?', fullName);
        return existsResult[0] && existsResult[0].id;
    }

    async _saveSchool({ full_name, short_name, type, abbreviations }) {  
        const result = await this.query('INSERT INTO school SET ?', { full_name, short_name, type });
        const schoolId = result.insertId;

        for (var abbreviation of abbreviations)
            await this.query('INSERT INTO school_alias SET ?', { name: abbreviation, school_id: schoolId });

        return;
    }

    async getTeamsWithNoSchool() {
        const results = await this.query(getTeamsWithNoSchool);
      
        return results;
    } 
}