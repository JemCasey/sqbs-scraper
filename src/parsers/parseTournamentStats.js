import rp from 'request-promise';
import cheerio from 'cheerio';
import parsePlayerStatLines from './parsePlayerStatLines';
import { MATCH_RESULTS_REGEX, SCORELINE_FORFEIT_REGEX, SCORELINE_REGEX, BONUS_LINE_REGEX, PLAYER_REGEX } from '../constants';
import parseYellowFruitTournamentStats from './parseYellowFruitTournamentStats';
import { gameInAnotherRound } from '../utils';

const extractTeamName = function (fullName) {
	return fullName.replace("(DII)", "").replace("(D2)", "").replace("(UG)", "").trim();
}

const parseTournamentStats = async function (tournament) {
	if (!tournament || !tournament.stats_urls)
		return tournament;
	var rounds = {};
	
	cheerio.prototype.even = function() {
		var evens = [];
		this.each(function(index, item) {
			if (index % 2 == 0) {
				evens.push(item);
			}
		});
	
		return cheerio(evens);
	};

	for (var url of tournament.stats_urls) {
		// if (url === 'https://hsquizbowl.org/db/tournaments/2868/stats/d2_only/')
		// 	debugger;
		var html = await rp(`${url}games/`);
		const $ = cheerio.load(html);

		$('img').each(function() { 
			$(this).replaceWith($(this).attr('src'))
		});

		if ($('*:contains("YellowFruit")').length) {
			rounds = parseYellowFruitTournamentStats(html, rounds);
			continue;
		}

		var tossupsRead = await parseTossupsRead(url);
		var tossupsHeard = await parseTossupsHeard(url);

		try {
			var selector = $('font[color="red"]');
			var noRounds = false;

			if (!selector.length) {
				selector = $('h1:contains("Scoreboard")');
				noRounds = true;
			}
	
			selector.each(function (k, v) {
				var matchResults = $(v).text().match(MATCH_RESULTS_REGEX);
				var roundName =  matchResults ? matchResults[1] : "All Rounds";

				if (!rounds[roundName])
					rounds[roundName] = {
						name: roundName,
						packet: matchResults ? matchResults[2] : null,						
						games: {}
					};
				
				//first round header (in font element) isn't wrapped in p like other round headers
				var currentGameTopLevel = (k > 0 || noRounds) ? v : $(v).parent();
				var currentGame = $(currentGameTopLevel).next().find('font[size="+1"]');
	
				while (currentGame.length && currentGame.attr("color") != "red") {
					var scoreline = currentGame.text().trim();
					var matchedScoreLine = [];
					var forfeit = false;
	
					var boxScore = null;
					var bonusLine = null;
	
					//The bonus line isn't always ordered {Winning team stats}, {Losing team stats}; these variables are used to account for that 
					var winningTeamBonusOffset = null;
					var losingTeamBonusOffset = null;
	
					if (scoreline.includes("forfeit")) {
						forfeit = true;
						matchedScoreLine = scoreline.match(SCORELINE_FORFEIT_REGEX);
					} else {
						matchedScoreLine = scoreline.match(SCORELINE_REGEX)
					}
	
					if (!forfeit) {
						boxScore = $(currentGame).next().next().text();
						bonusLine = boxScore.match(BONUS_LINE_REGEX);
						winningTeamBonusOffset = 0;
						losingTeamBonusOffset = 4;
						
						if (bonusLine && bonusLine[1] !== matchedScoreLine[1]) {
							winningTeamBonusOffset = 4;
							losingTeamBonusOffset = 0;
						}
					}

					var winningTeamName = extractTeamName(matchedScoreLine[1]);
					var losingTeamName = extractTeamName(matchedScoreLine[3]);
					var winningTeamIsDII = matchedScoreLine[1].includes("(DII)") || matchedScoreLine[1].includes("(D2)") || matchedScoreLine[1].includes("#");
					var losingTeamIsDII = matchedScoreLine[3].includes("(DII)") || matchedScoreLine[3].includes("(D2)") || matchedScoreLine[1].includes("#");
					var tossupsReadKey = forfeit ? null : `${matchedScoreLine[1].trim()}~${matchedScoreLine[3].trim()}~${matchedScoreLine[2].trim()}~${matchedScoreLine[4].trim()}`;

					if (!rounds[roundName].games[scoreline]) {
						var game = {
							scoreline,
							forfeit,
							tossups_read: forfeit ? null : (tossupsRead[tossupsReadKey] || 20),
							teams: [
								{
									won: true,
									name: winningTeamName.trim(),
									is_dii: winningTeamIsDII,
									is_ug: winningTeamIsDII || (matchedScoreLine[1].includes("(UG)") || matchedScoreLine[1].includes("*")),
									points: forfeit ? null : matchedScoreLine[2],
									bonuses_heard: forfeit ? null : bonusLine && parseInt(bonusLine[winningTeamBonusOffset + 2]),
									bonus_points: forfeit ? null : bonusLine && parseInt(bonusLine[winningTeamBonusOffset + 3]),
									ppb: forfeit ? null : parseFloat(bonusLine && bonusLine[winningTeamBonusOffset + 4]),
									players: forfeit ? null : addTossupsHeard(parsePlayerStatLines(matchedScoreLine[1], boxScore, tossupsHeard), tossupsHeard, matchedScoreLine[3])
								},
								{
									won: false,
									name: losingTeamName.trim(),
									is_dii: losingTeamIsDII,
									is_ug: losingTeamIsDII || (matchedScoreLine[3].includes("(UG)") || matchedScoreLine[3].includes("*")),
									points: forfeit ? null : matchedScoreLine[4],
									bonuses_heard: forfeit ? null : bonusLine && parseInt(bonusLine[losingTeamBonusOffset + 2]),
									bonus_points: forfeit ? null : bonusLine && parseInt(bonusLine[losingTeamBonusOffset + 3]),
									ppb: forfeit ? null : bonusLine && parseFloat(bonusLine[losingTeamBonusOffset + 4]),
									players: forfeit ? null : addTossupsHeard(parsePlayerStatLines(matchedScoreLine[3], boxScore, tossupsHeard), tossupsHeard, matchedScoreLine[1])
								}
							]
						};

						if (!gameInAnotherRound(game, rounds)) {
							rounds[roundName].games[scoreline] = game;
						}
					}

					currentGame = $(currentGame).parent().next().find('font[size="+1"]');
				}
			});
		} catch (error) {
			throw error;
		}
	};
	tournament.rounds = Object.values(rounds).map(r => { r.games = Object.values(r.games); return r; });

	return tournament;
};

const parseTossupsRead = async function(baseUrl) {
	var html = await rp(`${baseUrl}teamdetail/`);
	var $ = cheerio.load(html);
	var tuhHeader = $('table[border="1"] tr').eq(0).find('td').filter(":contains('TUH')");
	var tuhColumnIndex = tuhHeader.index() + 1;

	var tuhNotEntered = $(`table[border="1"] tr td:nth-child(${tuhColumnIndex})`).get()
		.reduce((a, b) => a + (parseInt($(b).html() || 0)), 0) === 0;
	var tossupsRead = {};
	if (tuhNotEntered)
		return tossupsRead;
	
	$('table[border="1"]').even().each((_, table) => {
		var teamName = $(table).prev().prev().text().trim();
		$(table).find('tr').each((_, v) => {
			var tuh = parseInt($(v).find(`td:nth-child(${tuhColumnIndex})`).text());
			if (!Number.isNaN(tuh)) {
				var opponent = $(v).find('td').eq(0).text().trim();
				var teamPoints = $(v).find('td').eq(2).text().trim();
				var oppPoints = $(v).find('td').eq(3).text().trim();

				tossupsRead[`${teamName}~${opponent}~${teamPoints}~${oppPoints}`] = tuh;
			}
		});
	});

	return tossupsRead;
}

const parseTossupsHeard = async function(baseUrl) {
	var html = await rp(`${baseUrl}playerdetail/`);
	var $ = cheerio.load(html);
	var tuhHeader = $('table[border="1"] tr').eq(0).find('td').filter(":contains('TUH')");
	var tuhColumnIndex = tuhHeader.index() + 1;
	var tuhNotEntered = $(`table[border="1"] tr td:nth-child(${tuhColumnIndex})`).get()
		.reduce((a, b) => a + (parseInt($(b).html() || 0)), 0) === 0;
	var tossupsHeard = {}
	if (tuhNotEntered)
		return tossupsHeard;

	$('table[border="1"]').each((_, table) => {
		var tableHeader = $(table).prev().prev().text().trim();
		var playerName = tableHeader.substr(0, tableHeader.lastIndexOf(','));
		
		$(table).find('tr').each((_, v) => {
			var tuh = parseInt($(v).find(`td:nth-child(${tuhColumnIndex})`).text());
			if (!Number.isNaN(tuh)) {
				var opponent = $(v).find('td').eq(0).text().trim();
				var points = $(v).find('td').last().text().trim();
				playerName = `${playerName} (`.match(PLAYER_REGEX)[1].trim();

				tossupsHeard[`${playerName}~${opponent}~${points}`] = tuh;
			}
		});
	});

	// if the tossups heard weren't entered correctly, don't even try to add them
	var tossupsHeardAll = Object.values(tossupsHeard)
	var averageTossupsHeard = tossupsHeardAll.reduce((a,b) => a + b, 0) / tossupsHeardAll.length;

	if (averageTossupsHeard < 10)
		tossupsHeard = {};

	return tossupsHeard;
}

const addTossupsHeard = function(players, tossupsHeard, opponent) {
	players.forEach(p => {
		p.tossups_heard = tossupsHeard[`${p.name}~${opponent.trim()}~${p.points}`] || 20;
	});

	return players;
}

export default parseTournamentStats;
