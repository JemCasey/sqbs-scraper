import rp from 'request-promise';
import $ from 'cheerio';
import parseTournamentStats from './parseTournamentStats';
import { BASE_URL } from '../constants';

const getStatsLinks = function (html) {
	var statsDiv = $('div[id="Stats"]', html), links = [];

	var completeStatsKeywords = [/\ball\b/, /\bcomplete\b/, /\bfinal\b/, /\bcombined\b/, /\bentire\b/, /\boverall\b/];

	statsDiv.find('a').each((_, el) => {
		completeStatsKeywords.forEach(regexp => {
			if (regexp.test($(el).text().toLowerCase())) {
				links.push(`${BASE_URL}${$(el).attr('href')}`);
				return false;
			}
		});
	});

	if (!links.length)
		links = statsDiv.find('a').map((_,el) => `${BASE_URL}${$(el).attr('href')}`).get();
	
	return links;
}

const removeEndDate = function (dateStr) {
	return dateStr.split(' - ')[0].replace(/-.*,/, ',');
}

const parseTournamentPage = async function (tournamentId, levels) {
	var url = BASE_URL + 'tournaments/' + tournamentId;
	var html = await rp(url);
	var tournament = null;

	try {
		if(levels && !$(levels.map(l => `.MainColumn h5:contains('${l}')`).join(','), html).length && $('.MainColumn h5', html).text().match(/.* tournament on .*/)) {
			return tournament;
		}

		var tournamentName = $('.MainColumn h2', html).first().text();
		var subtitle = $('.MainColumn h5', html).text();
		var tournamentType = subtitle.match(/(.*) tournament on .*/)[1];
		var tournamentDateStr = removeEndDate(subtitle.match(/tournament on (.+)/) ? subtitle.match(/tournament on (.+)/)[1] : subtitle);
		var tournamentProperties = $('p > span[class="FieldName"]', html).parent();
		var host = tournamentProperties.has('span:contains("Host")');
		var address = tournamentProperties.has('span:contains("Address")');
		var questionSetLink = tournamentProperties.has('span:contains("Question Set")').find('a');
		var date = new Date(tournamentDateStr);

		tournamentProperties.find('span').remove();

		tournament = {
			name: tournamentName,
			type: tournamentType,
			url: url,
			host: host.text().trim(),
			address: address.text().trim(),
			tournament_date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
			question_set: questionSetLink.length > 0 ? {
					name: questionSetLink.text(),
					url: BASE_URL + questionSetLink.attr('href')
			} : null,
			stats_urls: getStatsLinks(html)
		};

		if (tournament.stats_urls.length > 1 && (tournament.name.includes('Weekend') || tournament.name.includes('Event') || tournament.name.includes('Sunday')))
			throw 'Skipping tournament, side event groups not currently supported';

		tournament = await parseTournamentStats(tournament);

		return tournament;
	} catch (error) {
		throw error;
	}
};

export default parseTournamentPage;
