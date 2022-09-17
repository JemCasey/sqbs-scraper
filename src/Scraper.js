import parseTournamentPage from './parsers/parseTournamentPage';
import parseTournamentSearchResults from './parsers/parseTournamentSearchResults';
import parseNaqtTournamentResults from './parsers/parseNaqtTournamentResults';
import parseSchoolsFromNaqtTournament from './parsers/parseSchoolsFromNaqtTournament';
import parseWikipediaUniversityAbbreviationsList from './parsers/parseWikipediaUniversityAbbreviationsList';
import parseNAQTSchool from './parsers/parseNAQTSchool';
import parseTournamentStats from './parsers/parseTournamentStats';
import loadNeg5Stats from './parsers/loadNeg5Stats';

import { writeFile } from 'fs';
import { levels, countries } from './config';
import { NAQT } from './constants';
import { stripPunctuation } from './utils';

export default class Scraper {
	constructor(services) {
		Object.assign(this, services);

		this.levelMap = levels;
		this.countries = countries;
	}

	async scrapeSearchQuery(searchTerm, level, startDate, endDate) {
		var tournamentIds = await parseTournamentSearchResults(searchTerm, level, startDate, endDate);
		var blacklist = await this.tournamentService.getBlacklistedTournamentUrls();

		for (var tournamentId of tournamentIds) {
			try {
				var tournament = await parseTournamentPage(tournamentId);

				if (tournament && !blacklist.includes(tournament.url)) {
					await this.tournamentService.save(tournament);
				} else {
					console.log(`Didn't save tournament with id ${tournamentId}`);
				}
			} catch (message) {
				console.log(message);
				await this.errorService.save({ tournament_slug: tournamentId, message });
			}
		}

		console.log("Finished scraping search");
	}

	async scrapeStatsUrl(url, tournamentName, date) {
		// var tournamentDate = new Date(date);
		// var tournament = {
		// 	name: tournamentName,
		// 	url: url,
		// 	host: '',
		// 	address: '',
		// 	tournament_date: `${tournamentDate.getFullYear()}-${(tournamentDate.getMonth() + 1).toString().padStart(2, '0')}-${tournamentDate.getDate().toString().padStart(2, '0')}`,
		// 	question_set: null,
		// 	stats_urls: [
		// 		url
		// 	]
		// };

		var tournaments = [
			{ tournament_date: new Date("07/23/2017"), type: "Open", name: "2017 Jordaens @ Canada", url: "https://hsquizbowl.org/db/tournaments/4458", host: "Canada", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/4458/stats/jordaens_all_games/"]},
			{ tournament_date: new Date("07/23/2017"), type: "Open", name: "2017 Naveed Bork @ Canada", url: "https://hsquizbowl.org/db/tournaments/4458", host: "Canada", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/4458/stats/naveed_bork_combined/"]},
			{ tournament_date: new Date("08/25/2017"), type: "Open", name: "2017 WORLDSTAR @ Carleton Side Event Weekend 2K18", url: "https://hsquizbowl.org/db/tournaments/5204", host: "Carleton University", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/5204/stats/worldstar/"]},
			{ tournament_date: new Date("10/18/2014"), type: "College", name: "2014 Penn Bowl at McMaster and Toronto", url: "https://hsquizbowl.org/db/tournaments/2557", host: "McMaster and Toronto", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/2557/stats/penn_bowl_all_games/"]},
			{ tournament_date: new Date("10/18/2014"), type: "College", name: "2014 Padawan at McMaster and Toronto", url: "https://hsquizbowl.org/db/tournaments/2557", host: "McMaster and Toronto", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/2557/stats/padawan/"]},
			{ tournament_date: new Date("08/20/2016"), type: "Open", name: "2016 Listory at Carleton", url: "https://hsquizbowl.org/db/tournaments/3858", host: "Carleton University", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/3858/stats/listory_prelims/"]}
		]

		for (var tournament of tournaments) {
			try {
				tournament = await parseTournamentStats(tournament);

				if (tournament) {
					await this.tournamentService.save(tournament);
				} else {
					console.log(`Didn't save tournament with url ${tournament.url}`);
				}
			} catch (message) {
				console.log(message);
				await this.errorService.save({ tournament_slug: tournament.url.split('/').pop(), message });
			}			
		}

		console.log("Finished parsing tournament");
	}

	async loadNeg5Stats(_) {
		// var ids = ["HJm2sDq1f","Byt50kK4m","HkdSBIWd7","SJyadOUab","NkxRTTl1Zz","HJ9u6EmKG","mg54CL50O","E1gShIDNx-","h_t7_PaZ3","VkxrdhOEbZ","H1fwH3fkM","B1lIQNc8f","H1uBN5Y3Z","GrO8zGCdu"];
		var ids = ['V1xImv8UgG','HJm2sDq1f','HkdSBIWd7','SJyadOUab','NkxRTTl1Zz','HJ9u6EmKG','mg54CL50O','E1gShIDNx-','h_t7_PaZ3','VkxrdhOEbZ','GrO8zGCdu'];

		for (let id of ids) {
			try {
				var tournament = await loadNeg5Stats(id);
	
				if (tournament) {
					await this.tournamentService.save(tournament);
				}
			} catch (message) {
				console.log(message);
				await this.errorService.save({ tournament_slug: id, message });
			}
		}
	}

	async scrapeRange(firstId, lastId) {
		let i = firstId, results = [];
		var levels = ["College", "Open"];
		//let is = [6510,6539,6551,6546,6545,6585];
		//for (i of is) {
		for (i = firstId; i <= lastId; i++) {
			try {
				var tournament = await parseTournamentPage(i, levels);

				if (tournament) {
					results.push(tournament);
					//await this.tournamentService.save(tournament);
				}
			} catch (message) {
				console.log(message);
				await this.errorService.save({ tournament_slug: i, message });
			}
		}

		var json = JSON.stringify(results);

		writeFile('tournaments.json', json, 'utf8', function () { console.log(`Finished writing json representation of tournaments to test2.json`); });
	}

	parseTournamentPage(args) {
		parseTournamentPage(args.tournamentId)
			.then(function (tournament) {
				var json = JSON.stringify(tournament);

				writeFile(args.outputFile, json, 'utf8', function () { console.log(`Finished writing json representation of tournament ${args.tournamentId} to ${args.outputFile}`); });
			});
	}

	async scrapeUniversities(startYear, endYear) {
		var abbreviationMap = await parseWikipediaUniversityAbbreviationsList();
		var tournamentIds = await parseNaqtTournamentResults(startYear, endYear, NAQT.COLLEGE_AUDIENCE_ID);
		var schoolIds = new Set();
		var schools = [];
		for (var tournamentId of tournamentIds) {
			var tournamentSchoolIds = await parseSchoolsFromNaqtTournament(tournamentId);
			tournamentSchoolIds.forEach(id => schoolIds.add(id));
		}

		console.log("Saving schools to db...");
		for (var schoolId of schoolIds) {
			try {
				var school = await parseNAQTSchool(schoolId);
				school.abbreviations = abbreviationMap[stripPunctuation(school.full_name)] || abbreviationMap[stripPunctuation(school.short_name)] || [];
				school.abbreviations.filter(a => a !== school.full_name && a !== school.short_name);
				schools.push(school);

				await this.schoolService.save(school);
			} catch (message) {
				console.log(message);
				await this.errorService.save({ tournament_slug: schoolId, message });
			}
		}

		console.log("Finished writing universities to db!");
	}

	async scrapeDifficulties() {
		var difficultyMap = await this.difficultyService.getSetDifficulties();
		var questionSetsToAssign = await this.difficultyService.getQuestionSetsWithNoDifficulty();

		for (var questionSet of questionSetsToAssign) {
			var difficultyName = difficultyMap[questionSet.name];

			if (difficultyName) {
				var difficulty = await this.difficultyService.get(difficultyName), difficultyId;

				if (difficulty?.id)
					difficultyId = difficulty.id
				else
					difficultyId = await this.difficultyService.save({ name: difficultyName });

				await this.difficultyService.updateQuestionSetDifficulty(questionSet.id, difficultyId);
			}
		}
	}

	async fixTeamSchools() {
		var schools = await this.schoolService.getTeamsWithNoSchool();

		for (var school of schools) {
			await this.tournamentService.findAndSaveTeamSchool(school);
		}
	}

	async fixPlayers() {
		var playerTeams = await this.tournamentService.getPlayerTeamsWithNoPlayer();

		for (var playerTeam of playerTeams) {
			await this.tournamentService.findAndSavePlayer(playerTeam);
		}
	}
}