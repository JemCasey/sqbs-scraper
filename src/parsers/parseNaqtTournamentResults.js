import rp from 'request-promise';
import $ from 'cheerio';
import { NAQT } from '../constants';

const parseNaqtTournamentResults = async function (firstYear, lastYear, audienceId) {
	var tournamentIds = [];
	for (var i = firstYear; i <= lastYear; i++) {
		var html = await rp(`${NAQT.BASE_URL}tournament/?audience_id=${audienceId}&length=Any&state_code=&radius=&center_description=&year_code=${i}`);
		
		tournamentIds.push(...$('a[href^="/stats/tournament/standings"]', html)
			.map((_, v) => $(v).attr('href').match('tournament_id=(.*)')[1])
			.get());
	}

	return tournamentIds;
}

export default parseNaqtTournamentResults;