const rp = require('request-promise');
const $ = require('cheerio');
const constants = require('../constants');

const tournamentSearchResultsParse = function (args) {
	var urls = []

	for (i = args.firstPage; i <= args.firstPage + args.pageCount; i++) {
			urls.push(`${constants.BASE_URL}tournaments/search/${i}/?q=${args.searchTerm}`);
	}

	return Promise.all(urls.map(function (url) {
		return rp(url)
			.then(function (html) {
				var tournamentIds = [];
				var lis = $('.TournamentResults li', html);
				var levels = [];
				var levelsRegex = '';

				if (args.includeHighSchool)
					levels.push("High school");
				if (args.includeCollege)
					levels.push("College");
				if (args.includeOpen)
					levels.push("Open");
				if (args.includeMiddleSchool)
					levels.push("Middle school");
				if (args.includeTrash)
					levels.push("Trash");
				
				levelsRegex = new RegExp(levels.join("|"));

				lis.each(function (k, v) {
					var levelText = $(v).find('span.Details').text();
					var toAdd = args.includeAll || levelsRegex.test(levelText);

					if (toAdd) {
							tournamentIds.push($(v).find('a').attr('href').split('/')[1]);
					}
				});

				return tournamentIds;
			}).error(function (error) {
				console.log(error);

				return [];
			});
	}));
}

module.exports = tournamentSearchResultsParse;