const constants = require('../constants');

const escapeStringForRegex = function(string){
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const playersStatLinesParse = function(teamName, boxScore) {
	var pattern = `${escapeStringForRegex(teamName)}: (.*)`;
	var regex = new RegExp(pattern);
	var matchedTeam = boxScore.match(regex);

	if (!matchedTeam) {
		console.log(boxScore);
		console.log(teamName);
	}

	if (!matchedTeam[1])
		return [];

	var teamLine = matchedTeam[1].replace(", (", " (");

	return teamLine.split(', ').map(function(player) {
		var matchedPlayer = player.match(constants.PLAYER_REGEX);

		var statLine = matchedPlayer[3].trim().split(' ');

		while (statLine.length < 5)
			statLine.unshift(null);

		var isDII = matchedPlayer[2] === "(DII)" || matchedPlayer[2] === "(D2)";

		return {
			name: matchedPlayer[1].trim(),
			is_dii: isDII,
			is_ug: isDII || matchedPlayer[2] === "(UG)",
			super_powers: parseInt(statLine[0]),
			powers: parseInt(statLine[1]),
			gets: parseInt(statLine[2]),
			negs: parseInt(statLine[3]),
			pts: parseInt(statLine[4])
		};
	});
};

module.exports =  playersStatLinesParse;