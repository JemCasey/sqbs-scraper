const tournamentPageParse = require('./parsers/tournamentPageParse');
const tournamentSearchResultsParse = require('./parsers/tournamentSearchResultsParse');
const fs = require('fs');

const scrapeSearchResults = function(args) {
	tournamentSearchResultsParse(args)
	.then(function(tournamentIdArrays) {
		var tournamentIds = [];

		tournamentIdArrays.forEach(function(tournamentIdArray) {
			tournamentIdArray.forEach(function(tournamentId) {
				tournamentIds.push(tournamentId);
			});
		});

		return Promise.all(tournamentIds.map(function(tournament) {
			return tournamentPageParse(tournament);
		}));
	}).then(function(tournaments) {
		var filteredTournaments = tournaments.filter(function (t) { return t !== null; });
		var json = JSON.stringify(filteredTournaments);
		
		fs.writeFile(args.outputFile, json, 'utf8', function() { console.log(`Finished writing json representation of tournaments to ${args.outputFile}!`); });
	});
}

const parseTournamentPage = function(args) {
	tournamentPageParse(args.tournamentId)
	.then(function(tournament) {
		var json = JSON.stringify(tournament);
		
		fs.writeFile(args.outputFile, json, 'utf8', function() { console.log(`Finished writing json representation of tournament ${args.tournamentId} to ${args.outputFile}`); });
	});
}

module.exports = { scrapeSearchResults, parseTournamentPage };