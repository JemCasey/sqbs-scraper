import rp from 'request-promise';
import $ from 'cheerio';
import { NAQT } from '../constants';
import { delay } from '../utils';

const parseNAQTSchool = async function (schoolId) {
	var html = await rp(`${NAQT.BASE_URL}school/index.jsp?org_id=${schoolId}`);
	await delay(100);

	return {
		full_name: $('tbody tr', html).eq(1).find('td').text(),
		short_name: $('tbody tr', html).eq(2).find('td').text(),
		type:  $('tbody tr', html).eq(3).find('td').text(),
	};
}

export default parseNAQTSchool;