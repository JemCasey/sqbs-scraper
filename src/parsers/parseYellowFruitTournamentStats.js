import $ from 'cheerio';
import { gameInAnotherRound } from '../utils';

const mapPlayerProperty = (property) => {
	switch(property) {
		case 'TUH': return 'tossups_heard'
		case '20': return 'super_powers'
		case '15': return 'powers'
		case '10': return 'gets'
		case '-5': return 'negs'
		case 'Tot': return 'points'
	};
};

// YellowFruit's bonus lines aren't placed in html tags, which makes them a pain to traverse in cheerio.
// this method gets a dictionary for those bonus lines
const getBonusLines = (gamesHtml) => {
	if ($(".ContentContainer").clone().children().remove().end().text().trim() === "")
		return {};
		
	return $(".ContentContainer", gamesHtml)
	.clone()  
	.children()
	.remove(':not(h3):not(span[id])')
	.end()
	.text().split(/(forfeit| )\n/)
	.map(t => t.trim())
	.filter(t => t.length > 0)
	.reduce((acc, curr) => { 
		var parts = curr.split('\n\n\n'); 
		acc[parts[0].trim()] = parts[1]; 
		return acc; 
	}, {});
};

const getMaxTossupsHeard = (game) => {
	var maxTossupsHeard = 0;

	for (var team of game.teams) {
		for (var player of team.players) {
			maxTossupsHeard = maxTossupsHeard < player.tossups_heard ? player.tossups_heard : maxTossupsHeard;
		}
	}

	return maxTossupsHeard;
}

const parseYellowFruitTournamentStats = function (gamesHtml, rounds) {	
	var bonusLines = getBonusLines(gamesHtml);
	var roundsObj = $('.ContentContainer > h2, .ContentContainer > span[id], .ContentContainer > h3', gamesHtml).get().reduce((acc, curr) => { 
		var headerText = $(curr).text().trim();
		if ($(curr).is('h2')) {
			let packet = null;

			if ($(curr).next().is('span[style*="italic"]'))
				packet = $(curr).next().text().match(/Packet: (.*)/)[1];

			acc.rounds[headerText] = acc.rounds[headerText] || {
				packet,
				name: headerText,
				games: {}
			};
			acc.currentRound = headerText;
		} else if (!acc.rounds[acc.currentRound].games[headerText]) {
			var table = $(curr).next('table');
			var game = {
				scoreline: headerText,
				teams: []
			};
			var forfeit = game.scoreline.match(/(.*) defeats (.*) by forfeit/);

			if (forfeit) {
				game.forfeit = true;
				game.tossups_read = 0;
				game.teams.push({
					name: forfeit[1],
					win: true
				});
				game.teams.push({
					name: forfeit[2],
					win: false
				});
				return acc;
			} else {
				var headerRow = table.find('tr').eq(0);
				var bonusScoreline = bonusLines[game.scoreline]?.slice('Bonuses:'.length).split(';') || [];
	
				// iterate over teams
				headerRow.find('td[align="left"]').each(function() {
					var teamName = $(this).text().trim();
					var isDII = teamName.includes("(DII)") || teamName.includes("(D2)") || teamName.includes("#");
					var isUG = isDII || (teamName.includes("(UG)") ||teamName.includes("*"));
					var columnIndex = $(this).parent().find('td').index($(this));
					var bonusLinePart = bonusScoreline[columnIndex === 0 ? 0 : 1];
					
					var team = {
						name: teamName,
						is_dii: isDII,
						is_ug: isUG,
						players: [],
						bonuses_heard: bonusLinePart ? parseInt(bonusLinePart.match(/(\d*) heard/)[1]) : null,
						bonus_points: bonusLinePart ? parseInt(bonusLinePart.match(/(\d*) pts/)[1]) : null,
						ppb: bonusLinePart ? parseFloat(bonusLinePart.match(/([\d\.]*) PPB/)[1]) : null
					};
	
					// iterate over team's players
					table.find('tr').slice(1).each(function() {
						var playerName = $(this).find('td').eq(columnIndex).text().trim();
	
						if (!playerName || playerName === "Total")
							return;
	
						var playerDII = playerName.includes("(DII)") || playerName.includes("(D2)");
						var playerUG = playerDII || playerName.includes("(UG)");
						var player = {
							name: playerName,
							is_dii: playerDII,
							is_ug: playerUG
						};
						var tempColumnIndex = columnIndex + 1;
	
						while (headerRow.find('td').eq(tempColumnIndex).is('[align="right"]')) {
							var property = headerRow.find('td').eq(tempColumnIndex).text().trim();
							var value = $(this).find('td').eq(tempColumnIndex).text().trim();
	
							player[mapPlayerProperty(property)] = parseInt(value);
							tempColumnIndex++;
						};
	
						team.players.push(player);
					});
	
					team.points = team.bonus_points + team.players.reduce((acc, curr) => acc + curr.points, 0);
					game.teams.push(team);
				});
				// I'm too lazy to parse the team detail screen for yellowfruit, so using tossups heard and bonuses heard to estimate game length
				var maxTossupsHeard = getMaxTossupsHeard(game);
				var maxPoints = game.teams.reduce((acc, curr) => curr.points > acc ? curr.points : acc, 0);
				game.teams.forEach(t => t.won = t.points === maxPoints);
	
				var totalBonusesHeard = game.teams[0].bonuses_heard + game.teams[1].bonuses_heard;
				game.tossups_read = maxTossupsHeard > totalBonusesHeard ? maxTossupsHeard : totalBonusesHeard;
				game.forfeit = false;
			}

			if (!gameInAnotherRound(game, acc.rounds))
				acc.rounds[acc.currentRound].games[game.scoreline] = game;
		}
		return acc;
	}, { 
		currentRound: '', 
		rounds: rounds
	});

	return roundsObj.rounds;
}

export default parseYellowFruitTournamentStats;
