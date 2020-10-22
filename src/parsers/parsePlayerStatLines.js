import { PLAYER_REGEX } from '../constants';

const escapeStringForRegex = function(string){
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const parsePlayerStatLines = function(teamName, boxScore) {
	var pattern = `\n ?${escapeStringForRegex(teamName)}: (.*)`;
	var regex = new RegExp(pattern);
	var matchedTeam = boxScore.match(regex);

	if (!matchedTeam)
		debugger;
		
	if (!matchedTeam[1])
		return [];

	var teamLine = matchedTeam[1].replace(", (", " (");
	var players = {};

	teamLine.split(', ').forEach(function(player) {
		var matchedPlayer = player.match(PLAYER_REGEX);

		var statLine = matchedPlayer[3].trim().split(' ');

		while (statLine.length < 5)
			statLine.unshift(null);

		var isDII = matchedPlayer[2] === "(DII)" || matchedPlayer[2] === "(D2)";	

		// account for cases where teams with fewer than 4 members have "empty chair" players
		// with the same name as the team, e.g. https://hsquizbowl.org/db/tournaments/3607/stats/all_games/games/
		if (!teamName.startsWith(matchedPlayer[1]) || parseInt(statLine[4]) > 0) {			
			players[matchedPlayer[1]] = {
				name: matchedPlayer[1].trim(),
				is_dii: isDII,
				is_ug: isDII || matchedPlayer[2] === "(UG)",
				super_powers: statLine[0] ? parseInt(statLine[0]) : null,
				powers: statLine[1] ? parseInt(statLine[1]) : null,
				gets: statLine[2] ? parseInt(statLine[2]) : null,
				negs: statLine[3] ? parseInt(statLine[3]) : null,
				points: statLine[4] ? parseInt(statLine[4]) : null
			};
		}
	});
	
	return Object.values(players);
};

export default parsePlayerStatLines;