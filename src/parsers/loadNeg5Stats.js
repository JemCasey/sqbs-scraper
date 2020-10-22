import rp from 'request-promise';
import { NEG5 } from '../constants';

const getTeamDictionary = (teams) => {
    var teamDictionary = {};

    for (let { id, name, players } of teams) {
        teamDictionary[id] = { name, players };
    }

    return teamDictionary;
};

const loadNeg5Stats = async function (tournamentId) {
    var uri = `${NEG5.BASE_URL}/${tournamentId}`;
	var tournamentData = await rp({ uri, json: true });
    var tournament = {
        tournament_date: new Date("01/31/2015"), 
        type: "College", 
        name: tournamentData.name, 
        url: uri, 
        host: tournamentData.location,
        address: "",
        rounds: []
    };
    var teams = await rp({ uri: `${uri}/teams`, json: true });
    var teamDictionary = getTeamDictionary(teams);
    var teamFullStandings = await rp({ uri: `${uri}/stats/team-full-standings`, json: true });
    var playerFullStandings = await rp({ uri: `${uri}/stats/individual-full-standings`, json: true });
    var rounds = {};

    for (let team of teamFullStandings.teams) {
        let teamName = teamDictionary[team.teamId].name;
        let players = teamDictionary[team.teamId].players;

        for (let match of team.matches) {
            let roundString = `Round ${match.round}`;
            let gameKey = match.result === 'W' ? `${team.teamId}~${match.opponentTeamId}` : `${match.opponentTeamId}~${team.teamId}`;
            
            if (!rounds[roundString]) {
                rounds[roundString] = {
                    name: roundString,
                    games: {}
                };
            } 
            
            if (!rounds[roundString].games[gameKey]) {
                let opponentName = teamDictionary[match.opponentTeamId].name;
                rounds[roundString].games[gameKey] = {
                    scoreline: match.result === 'W' ? 
                        `${teamName} ${match.points}, ${opponentName} ${match.opponentPoints}` 
                        : `${opponentName} ${match.opponentPoints}, ${teamName} ${match.points}`,
                    forfeit: false,
                    tossups_read: match.tossupsHeard,
                    teams: []
                };
            }

            rounds[roundString].games[gameKey].teams.push({
                name: teamName,
                is_dii: false,
                is_ug: false,
                won: match.result === 'W',
                points: match.points,
                bonuses_heard: match.bonusesHeard,
                bonus_points: match.bonusPoints,
                ppb: match.pointsPerBonus,
                players: players.map(player => {
                    var playerGame = playerFullStandings.players
                        .find(p => p.playerId === player.id)
                        .matches.find(m => m.round === match.round && m.opponentTeamId === match.opponentTeamId);
                    
                    if (!playerGame)
                        return null;

                    return {
                        name: player.name,
                        is_dii: false,
                        is_ug: false,
                        tossups_heard: playerGame.percentGamePlayed * match.tossupsHeard,
                        points: playerGame.points,
                        super_powers: null,
                        powers: playerGame.tossupAnswerCounts.find(a => a.answerType === "Power")?.total || 0,
                        gets: playerGame.tossupAnswerCounts.find(a => a.answerType === "Base")?.total || 0,
                        negs: playerGame.tossupAnswerCounts.find(a => a.answerType === "Neg")?.total || 0
                    };
                }).filter(p => p)
            });
        }
    }

    tournament.rounds = Object.values(rounds).map(r => { r.games = Object.values(r.games); return r; });

    return tournament;
}

export default loadNeg5Stats;