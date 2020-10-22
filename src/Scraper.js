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
			// { tournament_date: new Date("07/20/2013"), type: "Open", name: "Chicago Open 2013", url: "https://hsquizbowl.org/db/tournaments/1545/stats/chicago_open_2013_all_games/", host: "The University of Chicago", address: "The University of Chicago, Chicago, Illinois", stats_urls: ["https://hsquizbowl.org/db/tournaments/1545/stats/chicago_open_2013_all_games/"] },
			// { tournament_date: new Date("07/21/2013"), type: "Open", name: "Urgent Call for Unity", url: "https://hsquizbowl.org/db/tournaments/1545/stats/history_side_event_-_final/", host: "The University of Chicago", address: "The University of Chicago, Chicago, Illinois", stats_urls: ["https://hsquizbowl.org/db/tournaments/1545/stats/history_side_event_-_final/"] },
			// { tournament_date: new Date("08/06/2016"), type: "Open", name: "NASAT at Berkeley", url: "https://hsquizbowl.org/db/tournaments/3778/stats/nasat/", host: "UC Berkeley", address: "Barrows Hall, Berkeley, California", stats_urls: ["https://hsquizbowl.org/db/tournaments/3778/stats/nasat/"] },
			// { tournament_date: new Date("08/06/2016"), type: "Open", name: "Listory at Berkeley", url: "https://hsquizbowl.org/db/tournaments/3778/stats/listory/", host: "UC Berkeley", address: "Barrows Hall, Berkeley, California", stats_urls: ["https://hsquizbowl.org/db/tournaments/3778/stats/listory/"] },
			// { tournament_date: new Date("08/06/2016"), type: "Open", name: "ARTSEE at Berkeley", url: "https://hsquizbowl.org/db/tournaments/3778/stats/artsee/", host: "UC Berkeley", address: "Barrows Hall, Berkeley, California", stats_urls: ["https://hsquizbowl.org/db/tournaments/3778/stats/artsee/"] },
			// { tournament_date: new Date("08/06/2016"), type: "Open", name: "A Culture of Improvement at Berkeley", url: "https://hsquizbowl.org/db/tournaments/3778/stats/a_culture_of_improvement/", host: "UC Berkeley", address: "Barrows Hall, Berkeley, California", stats_urls: ["https://hsquizbowl.org/db/tournaments/3778/stats/a_culture_of_improvement/"] },
			// { tournament_date: new Date("08/06/2016"), type: "Open", name: "Listory at VCU", url: "https://hsquizbowl.org/db/tournaments/3810/stats/listory/", host: "VCU", address: "900 W Main St, Richmond, Virginia 23220", stats_urls: ["https://hsquizbowl.org/db/tournaments/3810/stats/listory/"] },
			// { tournament_date: new Date("08/06/2016"), type: "Open", name: "ARTSEE at VCU", url: "https://hsquizbowl.org/db/tournaments/3810/stats/artsee/", host: "VCU", address: "900 W Main St, Richmond, Virginia 23220", stats_urls: ["https://hsquizbowl.org/db/tournaments/3810/stats/artsee/"] },
			// { tournament_date: new Date("08/06/2016"), type: "Open", name: "A Culture of Improvement at VCU", url: "https://hsquizbowl.org/db/tournaments/3810/stats/culture_of_improvement/", host: "VCU", address: "900 W Main St, Richmond, Virginia 23220", stats_urls: ["https://hsquizbowl.org/db/tournaments/3810/stats/culture_of_improvement/"] },
			// { tournament_date: new Date("10/23/2016"), type: "Open", name: "ARTSEE at Cambridge", url: "https://hsquizbowl.org/db/tournaments/4029/stats/artsee/", host: "Clare Memorial Court, Cambridge", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/4029/stats/artsee/"] },
			// { tournament_date: new Date("10/23/2016"), type: "Open", name: "Listory at Cambridge", url: "https://hsquizbowl.org/db/tournaments/4029/stats/listory/", host: "Clare Memorial Court, Cambridge", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/4029/stats/listory/"] },
			// { tournament_date: new Date("08/05/2017"), type: "Open", name: "GEODUCK at VCU", url: "https://hsquizbowl.org/db/tournaments/4489/stats/geoduck/", host: "VCU", address: "900 W Main St, Richmond, Virginia 23220", stats_urls: ["https://hsquizbowl.org/db/tournaments/4489/stats/geoduck/"] },
			// { tournament_date: new Date("08/05/2017"), type: "Open", name: "XENOPHON at VCU", url: "https://hsquizbowl.org/db/tournaments/4489/stats/xenophon/", host: "VCU", address: "900 W Main St, Richmond, Virginia 23220", stats_urls: ["https://hsquizbowl.org/db/tournaments/4489/stats/xenophon/"] },
			// { tournament_date: new Date("08/05/2017"), type: "Open", name: "There Will Be Stock Clues at VCU", url: "https://hsquizbowl.org/db/tournaments/4489/stats/stock_clues/", host: "VCU", address: "900 W Main St, Richmond, Virginia 23220", stats_urls: ["https://hsquizbowl.org/db/tournaments/4489/stats/stock_clues/"] },
			// { tournament_date: new Date("08/19/2017"), type: "Open", name: "GEODUCK at Michigan", url: "https://hsquizbowl.org/db/tournaments/4509/stats/geoduck_-_all_games/", host: "University of Michigan", address: "435 South State Street, Ann Arbor, Michigan 48104", stats_urls: ["https://hsquizbowl.org/db/tournaments/4509/stats/geoduck_-_all_games/"] },
			// { tournament_date: new Date("08/19/2017"), type: "Open", name: "Thought Monstrosity at Michigan", url: "https://hsquizbowl.org/db/tournaments/4509/stats/thought_monstrosity_-_combined/", host: "University of Michigan", address: "435 South State Street, Ann Arbor, Michigan 48104", stats_urls: ["https://hsquizbowl.org/db/tournaments/4509/stats/thought_monstrosity_-_combined/"] },
			// { tournament_date: new Date("08/19/2017"), type: "Open", name: "There Will Be Stock Clues at Michigan", url: "https://hsquizbowl.org/db/tournaments/4509/stats/stock_clues_-_all_games/", host: "University of Michigan", address: "435 South State Street, Ann Arbor, Michigan 48104", stats_urls: ["https://hsquizbowl.org/db/tournaments/4509/stats/stock_clues_-_all_games/"] },
			// { tournament_date: new Date("10/15/2017"), type: "Open", name: "GEODUCK at Cambridge", url: "https://hsquizbowl.org/db/tournaments/4665/stats/geoduck/", host: "Cambridge", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/4665/stats/geoduck/"] },
			// { tournament_date: new Date("10/15/2017"), type: "Open", name: "There Will Be Stock Clues at Cambridge", url: "https://hsquizbowl.org/db/tournaments/4665/stats/stock_clues/", host: "Cambridge", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/4665/stats/stock_clues/"] },
			// { tournament_date: new Date('07/28/2018'), type: "Open", name: "The Human Use of Human Beings at VCU", url: "https://hsquizbowl.org/db/tournaments/5131/stats/human_use_of_human_beings/", host: "VCU", address: "900 W Main St, Richmond, Virginia 23220", stats_urls: ["https://hsquizbowl.org/db/tournaments/5131/stats/human_use_of_human_beings/"] },
			// { tournament_date: new Date('08/04/2018'), type: "Open", name: "NASAT at Stanford", url: "https://hsquizbowl.org/db/tournaments/5124/stats/nasat/", host: "Stanford University", address: "94305", stats_urls: ["https://hsquizbowl.org/db/tournaments/5124/stats/nasat/"] },
			// { tournament_date: new Date('08/04/2018'), type: "Open", name: "OCTAVIAN at Stanford", url: "https://hsquizbowl.org/db/tournaments/5124/stats/octavian/", host: "Stanford University", address: "94305", stats_urls: ["https://hsquizbowl.org/db/tournaments/5124/stats/octavian/"] },
			// { tournament_date: new Date('08/04/2018'), type: "Open", name: "WORLDSTAR at Stanford", url: "https://hsquizbowl.org/db/tournaments/5124/stats/worldstar/", host: "Stanford University", address: "94305", stats_urls: ["https://hsquizbowl.org/db/tournaments/5124/stats/worldstar/"] },
			// { tournament_date: new Date('08/04/2018'), type: "Open", name: "The Human Use of Human Beings at Stanford", url: "https://hsquizbowl.org/db/tournaments/5124/stats/the_human_use_of_human_beings/", host: "Stanford University", address: "94305", stats_urls: ["https://hsquizbowl.org/db/tournaments/5124/stats/the_human_use_of_human_beings/"] },
			// { tournament_date: new Date('08/04/2018'), type: "Open", name: "WORLDSTAR at MIT", url: "https://hsquizbowl.org/db/tournaments/5139/stats/worldstar/", host: "Massachusetts Institute of Technology", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/5139/stats/worldstar/"] },
			// { tournament_date: new Date('08/04/2018'), type: "Open", name: "Words and Objects at MIT", url: "https://hsquizbowl.org/db/tournaments/5139/stats/words_and_objects/", host: "Massachusetts Institute of Technology", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/5139/stats/words_and_objects/"] },
			// { tournament_date: new Date("08/19/2017"), type: "Open", name: "NASAT at Carleton", url: "https://hsquizbowl.org/db/tournaments/4506/stats/nasat/", host: "Carleton University", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/4506/stats/nasat/"] },
			// { tournament_date: new Date("08/19/2017"), type: "Open", name: "GEODUCK at Carleton", url: "https://hsquizbowl.org/db/tournaments/4506/stats/geoduck/", host: "Carleton University", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/4506/stats/geoduck/"] },
			// { tournament_date: new Date("04/02/2016"), type: "College", name: "2016 MYSTERIUM at Northwestern", url: "https://www.qbwiki.com/statistics/2016-mysterium-northwestern/2016-mysterium-northwestern_", host: "Northwestern University", address: "", stats_urls: ["https://www.qbwiki.com/statistics/2016-mysterium-northwestern/2016-mysterium-northwestern_"] },
			// { tournament_date: new Date("02/09/2013"), type: "College", name: "2013 Region 8 Sectional Championship - Division II", url: "https://www.qbwiki.com/statistics/2013-sct-uic/division-ii_", host: "University of Illinois at Chicago", address: "", stats_urls: ["https://www.qbwiki.com/statistics/2013-sct-uic/division-ii_"] },
			// { tournament_date: new Date("11/05/2016"), type: "College", name: "2016 ACF Fall at Northwestern", url: "https://www.qbwiki.com/statistics/2016-acf-fall-northwestern/prelim_", host: "Northwestern University", address: "", stats_urls: ["https://www.qbwiki.com/statistics/2016-acf-fall-northwestern/prelim_"] },
			// { tournament_date: new Date("01/30/2016"), type: "College", name: "2016 ACF Regionals at UChicago", url: "https://www.qbwiki.com/statistics/2016-acf-regionals-chicago/combined_", host: "UChicago", address: "", stats_urls: ["https://www.qbwiki.com/statistics/2016-acf-regionals-chicago/combined_"] },
			// { tournament_date: new Date("03/08/2014"), type: "Open", name: "2014 Cane Ridge Revival at UChicago", url: "https://www.qbwiki.com/statistics/2014-cane-ridge-revival/2014-cane-ridge-revival_", host: "UChicago", address: "", stats_urls: ["https://www.qbwiki.com/statistics/2014-cane-ridge-revival/2014-cane-ridge-revival_"] },
			// { tournament_date: new Date("02/19/2011"), type: "Open", name: "2011 Sack of Antwerp at UChicago", url: "https://www.qbwiki.com/uchicago/2011_SackofAntwerp/overall_", host: "UChicago", address: "", stats_urls: ["https://www.qbwiki.com/uchicago/2011_SackofAntwerp/overall_"] },
			// { tournament_date: new Date("09/25/2010"), type: "College", name: "2010 ACF Novice", url: "https://www.qbwiki.com/uchicago/2010_ACF_Novice/overall_", host: "WUSTL", address: "", stats_urls: ["https://www.qbwiki.com/uchicago/2010_ACF_Novice/overall_"] },
			// { tournament_date: new Date("09/24/2011"), type: "College", name: "2011 Early Autumn Collegiate Novice @ UChicago", url: "https://www.qbwiki.com/uchicago/2011_EACNT/2011_EACNT_UChicago_", host: "UChicago", address: "", stats_urls: ["https://www.qbwiki.com/uchicago/2011_EACNT/2011_EACNT_UChicago_"] },
			// { tournament_date: new Date("02/04/2012"), type: "College", name: "2012 NAQT SCT at UChicago - Division II", url: "https://www.qbwiki.com/uchicago/2012_SCT/2012_SCT_UChicago_DII_", host: "UChicago", address: "", stats_urls: ["https://www.qbwiki.com/uchicago/2012_SCT/2012_SCT_UChicago_DII_"] },
			// { tournament_date: new Date("07/18/2015"), type: "Open", name: "2015 Chicago Open", url: "https://www.qbwiki.com/statistics/2015-chicago-open/2015_Chicago_Open_", host: "UChicago", address: "", stats_urls: ["https://www.qbwiki.com/statistics/2015-chicago-open/2015_Chicago_Open_"] }
			{ tournament_date: new Date("01/31/2015"), type: "Open", name: "Oxford Open 2015", url: "https://hsquizbowl.org/db/tournaments/2355", host: "Oxford", address: "", stats_urls: ["https://hsquizbowl.org/db/tournaments/2355/stats/including_final/"]}
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
				await this.errorService.save({ tournament_slug: tournament.url, message });
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
		let is = [6510,6539,6551,6546,6545,6585];
		for (i of is) {
		//for (i = firstId; i <= lastId; i++) {
			try {
				var tournament = await parseTournamentPage(i, levels);

				if (tournament) {
					results.push(tournament);
					await this.tournamentService.save(tournament);
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