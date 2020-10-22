import rp from 'request-promise';
import $ from 'cheerio';
import { NAQT } from '../constants';
import { delay } from '../utils';

const parseSchoolsFromNaqtTournament = async function (tournamentId) {
    var schoolIds = new Set();
    var html = await rp(`${NAQT.BASE_URL}tournament/standings.jsp?tournament_id=${tournamentId}`);
    var teamIds = $('a[href^="/stats/tournament/team.jsp"]', html)
        .map((_, v) => $(v).attr('href').match('team_id=(.*)')[1])
        .get();

    for (var teamId of teamIds) {
        var teamPageHtml = await rp(`${NAQT.BASE_URL}tournament/team.jsp?team_id=${teamId}`);
        var schoolIdParam = $('a[href^="/stats/school/results"]', teamPageHtml).first().attr('href'), schoolId;
        
        if (schoolIdParam) {
            schoolId = schoolIdParam.match('org_id=(.*)')[1];
            schoolIds.add(schoolId);
        } else {
            console.log(`Failed to find school id for team ${teamId}`);
        }
        
        await delay(100);
    }

	return Array.from(schoolIds);
}

export default parseSchoolsFromNaqtTournament;