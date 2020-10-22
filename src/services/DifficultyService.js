import util from 'util';
import rp from 'request-promise';
import { QUIZDB_URL } from '../constants';

export default class DifficultyService {
	constructor(connection) {
        this.connection = connection;
        this.query = util.promisify(connection.query).bind(connection);
    }

    async getSetDifficulties() {
        var data = await rp({
            uri: QUIZDB_URL,
            headers: {
                'User-Agent': 'sqbs-scraper'
            },
            json: true
        });

        return data.tournament.reduce((prev, curr) => { 
            prev[curr.name] = curr.difficulty;
            return prev;
        }, {});
    }

    async save({ name }) {
        const result = await this.query('INSERT INTO difficulty SET ?', { name });

        return result.insertId;
    }

    async get(name) {
        const result = await this.query('SELECT id, name, last_modified FROM difficulty WHERE name = ?', name);

        return result[0];
    }

    async updateQuestionSetDifficulty(id, difficulty_id) {
        await this.query('UPDATE question_set SET difficulty_id = ? WHERE id = ?', [difficulty_id, id]);   
    }

    async getQuestionSetsWithNoDifficulty() {
        const result = await this.query('SELECT id, name, last_modified FROM question_set WHERE difficulty_id IS NULL');
        
        return result;
    }
}