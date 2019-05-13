const rp = require('request-promise');
const $ = require('cheerio');
const playersStatLinesParse = require('./playerStatLinesParse');
const constants = require('../constants');

const extractTeamName = function (fullName) {
	return fullName.replace("(DII)", "").replace("(D2)", "").replace("(UG)", "").trim();
}

const tournamentStatsParse = function (tournament) {
	if (!tournament || !tournament.stats_url)
		return tournament;

	var roundsUrl = tournament.stats_url + 'games/';

	return rp(roundsUrl)
		.then(function (html) {
			var rounds = [];

			try {
				var selector = $('font[color="red"]', html);
				var noRounds = false;

				if (!selector.length) {
					selector = $('h1:contains("Scoreboard")', html);
					noRounds = true;
				}

				rounds = selector.map(function (k, v) {
					var matchResults = $(v).text().match(constants.MATCH_RESULTS_REGEX);
					var games = [];

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
							matchedScoreLine = scoreline.match(constants.SCORELINE_FORFEIT_REGEX);
						} else {
							matchedScoreLine = scoreline.match(constants.SCORELINE_REGEX)
						}

						if (!forfeit) {
							boxScore = $(currentGame).next().next().text();
							bonusLine = boxScore.match(constants.BONUS_LINE_REGEX);
							winningTeamBonusOffset = 0;
							losingTeamBonusOffset = 4;
							
							if (bonusLine[1] !== matchedScoreLine[1]) {
								winningTeamBonusOffset = 4;
								losingTeamBonusOffset = 0;
							}
						}

						var winningTeamName = extractTeamName(matchedScoreLine[1]);
						var losingTeamName = extractTeamName(matchedScoreLine[3]);
						var winningTeamIsDII = matchedScoreLine[1].includes("(DII)") || matchedScoreLine[1].includes("(D2)") || matchedScoreLine[1].includes("#");
						var losingTeamIsDII = matchedScoreLine[3].includes("(DII)") || matchedScoreLine[3].includes("(D2)") || matchedScoreLine[1].includes("#");

						games.push({
							scoreline: scoreline,
							forfeit: forfeit,
							winning_team: {
								name: winningTeamName.trim(),
								is_dii: winningTeamIsDII,
								is_ug: winningTeamIsDII || (matchedScoreLine[1].includes("(UG)") || matchedScoreLine[1].includes("*")),
								score: forfeit ? null : matchedScoreLine[2],
								bonuses_heard: forfeit ? null : parseInt(bonusLine[winningTeamBonusOffset + 2]),
								bonus_points: forfeit ? null : parseInt(bonusLine[winningTeamBonusOffset + 3]),
								ppb: forfeit ? null : parseFloat(bonusLine[winningTeamBonusOffset + 4]),
								players: forfeit ? null : playersStatLinesParse(matchedScoreLine[1], boxScore)
							},
							losing_team: {
								name: losingTeamName.trim(),
								is_dii: losingTeamIsDII,
								is_ug: losingTeamIsDII || (matchedScoreLine[3].includes("(UG)") || matchedScoreLine[3].includes("*")),
								score: forfeit ? null : matchedScoreLine[4],
								bonuses_heard: forfeit ? null : parseInt(bonusLine[losingTeamBonusOffset + 2]),
								bonus_points: forfeit ? null : parseInt(bonusLine[losingTeamBonusOffset + 3]),
								ppb: forfeit ? null : parseFloat(bonusLine[losingTeamBonusOffset + 4]),
								players: forfeit ? null : playersStatLinesParse(matchedScoreLine[3], boxScore)
							}
						});

						currentGame = $(currentGame).parent().next().find('font[size="+1"]');
					}

					return {
						number: matchResults ? parseInt(matchResults[1]) : "all",
						packet: matchResults ? matchResults[2] : null,
						games: games
					};
				}).get();
			} catch (error) {
				console.log(error);
			}

			tournament.rounds = rounds;

			return tournament;
		})
		.error(function (error) {
			console.log(error);

			return null;
		});
};

module.exports = tournamentStatsParse;
