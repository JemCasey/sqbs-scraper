const rp = require('request-promise');
const $ = require('cheerio');
const tournamentStatsParse = require('./tournamentStatsParse');
const constants = require('../constants');

const getStatsLink = function (html) {
	var statsDiv = $('div[id="Stats"]', html);
	var linkLi = null;
	var url = null;

	//keywords in stat links in opposite order of which they should be prioritized
	var keywords = ['Prelim', 'Playoffs', 'Stats', 'Round Robin', 'All', 'Final', 'All Games', 'Combined'];

	do {
		linkLi = statsDiv.find(`li:contains("${keywords.pop()}")`);
	}
	while (!linkLi.length && keywords.length);

	if (linkLi.length)
		url = constants.BASE_URL + linkLi.find('a').attr('href');

	return url;
}

const removeEndDate = function (dateStr) {
	return dateStr.replace(/\-[0-9]{1,2},/, ",");
}

const tournamentPageParse = function (tournamentId) {
	var url = constants.BASE_URL + 'tournaments/' + tournamentId;

	return rp(url)
		.then(function (html) {
			var tournament = null;

			try {
				var tournamentName = $('.MainColumn h2', html).first().text();
				var tournamentDateStr = removeEndDate($('.MainColumn h5', html).text().match(/tournament on (.+)/)[1]);
				var tournamentProperties = $('p > span[class="FieldName"]', html).parent();
				var host = tournamentProperties.has('span:contains("Host")');
				var address = tournamentProperties.has('span:contains("Address")');
				var questionSetLink = tournamentProperties.has('span:contains("Question Set")').find('a');

				var date = new Date(tournamentDateStr);

				tournamentProperties.find('span').remove();

				tournament = {
					name: tournamentName,
					url: url,
					stats_url: getStatsLink(html),
					host: host.text().trim(),
					address: address.text().trim(),
					date: +date,
					year: date.getFullYear(),
					month: date.getMonth() + 1,
					question_set: questionSetLink.length > 0 ? {
							name: questionSetLink.text(),
							url: constants.BASE_URL + questionSetLink.attr('href')
					} : null
				};
			} catch {
			}

			return tournament;
		})
		.then(function (tournament) {
				if (tournament)
						tournament = tournamentStatsParse(tournament);

				return tournament;
		}).error(function (error) {
				console.log(error);

				return null;
		});
};

module.exports = tournamentPageParse;
