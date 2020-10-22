export function stripPunctuation(str) {
    return str ? str.replace(/[^\w]/g, "").toLowerCase() : '';
}

export function delay(t, val) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
 }


 export const gameInAnotherRound = function(game, rounds) {
	for (var round in rounds) {
		var gameWithMatchingScoreline = rounds[round].games[game.scoreline];

		if (gameWithMatchingScoreline && gamesAreDuplicates(game, gameWithMatchingScoreline))
			return true;
	}

	return false;
}

export const gamesAreDuplicates = function(game1, game2) {
	var winningTeam1 = game1.teams[0];
	var winningTeam2 = game2.teams[0];
	var losingTeam2 = game1.teams[1];
	var losingTeam2 = game1.teams[1];

	return winningTeam1.points === winningTeam2.points
		&& losingTeam2.points === losingTeam2.points
		&& winningTeam1.bonuses_heard === winningTeam2.bonuses_heard
		&& losingTeam2.bonuses_heard === losingTeam2.bonuses_heard
		&& winningTeam1.bonus_points === winningTeam2.bonus_points
		&& losingTeam2.bonus_points === losingTeam2.bonus_points;	
}