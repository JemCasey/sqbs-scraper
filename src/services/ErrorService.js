import util from 'util';

export default class ErrorService {
	constructor(connection) {
        this.connection = connection;
        this.query = util.promisify(connection.query).bind(connection);
    }

    async save({ tournament_slug, message }) {
        const result = await this.query('INSERT INTO error SET ?', { tournament_slug, message });

        return result.insertId;
    }
}