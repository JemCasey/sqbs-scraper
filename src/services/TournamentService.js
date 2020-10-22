import util from 'util';
import { commonNameDiminutives } from '../config';
import { getPlayerTeamsWithNoPlayer } from '../db/queries';

export default class TournamentService {
	constructor(connection) {
        this.connection = connection;
        this.query = util.promisify(connection.query).bind(connection);
    }

    async getBlacklistedTournamentUrls() {
        let result = await this.query("SELECT url FROM tournament_blacklist");

        return result.map(r => r.url);
    }

    async save(tournament) {
        try {
            await this.query("START TRANSACTION");
            var tournamentInDB = await this._tournamentInDB(tournament.url);

            if (tournamentInDB)
                throw "Tournament already in database";
            
            if (!tournament.rounds?.length) {
                console.log(`tournament ${tournament.name} has no stats, won't be saved`)
                return;
            }

            var questionSetId = null, tournamentId, teams = {}, players = {};
            var isOpen = tournament.type === 'Open' || (tournament.name.includes("Open") && !tournament.name.includes("Closed"));
            
            if (tournament.question_set)
                questionSetId = await this._saveQuestionSet(tournament.question_set);
            
            tournamentId = await this._saveTournament({ ...tournament, question_set_id: questionSetId});

            for (var round of tournament.rounds) {
                var roundId = await this._saveRound({ ...round, tournament_id: tournamentId});

                for (var game of round.games) {
                    var gameId = await this._saveGame({...game, round_id: roundId});
                    
                    for (var team of game.teams) {
                        var existingTeam = teams[team.name], teamId;

                        if (!existingTeam) {
                            var schoolId = await this._getSchoolId(team.name, tournament);

                            if (!schoolId) {
                                console.log(`Unable to find school for team ${team.name} at tournament ${tournamentId}`)
                            }

                            teamId = await this._saveTeam({ 
                                name: team.name,
                                school_id: schoolId,
                                tournament_id: tournamentId, 
                                is_dii: team.is_dii,
                                is_ug: team.is_ug 
                            });
                            teams[team.name] = existingTeam = {
                                teamId,
                                schoolId
                            };
                        } else {
                            teamId = existingTeam.teamId;
                        }

                        await this._saveTeamGame({
                            ...team,
                            team_id: teamId, 
                            game_id: gameId
                        });

                        if (!team.players)
                            continue;

                        for (var player of team.players) {
                            var playerNameInStats = player.name;
                            player.name = this._preparePlayerNameForSave(player.name);
                            var playerId = players[`${team.name}~${player.name}`];

                            if (!playerId) {
                                playerId = await this._getPlayerId(player.name, existingTeam.schoolId, tournamentId);

                                if (!playerId) {
                                    let nameDiminutiveReversed = this._reverseNameDiminutive(player.name);

                                    if ((!isOpen || player.name.includes(' ')) && nameDiminutiveReversed !== player.name) {
                                        console.log(`looking for ${nameDiminutiveReversed} in place of ${player.name}`);
                                        playerId = await this._getPlayerId(nameDiminutiveReversed, existingTeam.schoolId, tournamentId);
                                        if (playerId) console.log(`found ${nameDiminutiveReversed}`);
                                    }

                                    if (!playerId)
                                        playerId = await this._savePlayer(player);
                                } 

                                players[`${team.name}~${player.name}`] = playerId;

                                await this._savePlayerTeam({
                                    player_id: playerId,
                                    team_id: teamId,
                                    name_in_stats: playerNameInStats
                                })
                            }

                            await this._savePlayerGame({
                                ...player,
                                player_id: playerId, 
                                game_id: gameId
                            });                            
                        }
                    }
                };
            };

            await this.query("COMMIT");

            return tournamentId;
        } catch (err) {
            await this.query("ROLLBACK");
            console.log("rolled back transaction");
            throw err;
        }
    }

    _reverseNameDiminutive(name) { 
        for (var pair of commonNameDiminutives) {
            if (name.match(pair.fullRegex)) {
                name = name.replace(pair.fullRegex, pair.short);
                return name;
            }

            if (name.match(pair.shortRegex)) {
                name = name.replace(pair.shortRegex, pair.full);
                return name;
            }
        }

        return name;
    }

    async findAndSaveTeamSchool({ id, name, tournament_name, host, address }) {
        var schoolId = await this._getSchoolId(name, { name: tournament_name, host, address });

        if (!schoolId) {
            console.log(`Unable to find school for team ${id} ${name}`)
        } else {
            console.log(`Setting team ${id} ${name} to school ${schoolId}`);
            await this._updateTeamSchool(id, schoolId);
        }
    }
 
    async findAndSavePlayer({ id, name, school_id, tournament_id }) {
        let playerId = await this._getPlayerId(name, school_id, tournament_id);

        if (!playerId) {
            playerId = await this._savePlayer({ name });
        }

        await this._updatePlayerTeamPlayer(id, playerId);
    }

    async getPlayerTeamsWithNoPlayer() {
        const results = await this.query(getPlayerTeamsWithNoPlayer);
      
        return results;
    }

    async _tournamentInDB(url) {
        const existsResult = await this.query('SELECT id FROM tournament WHERE url = ?', url);
        return existsResult[0] && existsResult[0].id;
    }

    async _saveQuestionSet({ name, url }) {
        const existsResult = await this.query('SELECT id FROM question_set WHERE url = ?', url);
        var id = existsResult[0] ? existsResult[0].id : null;

        const result = id ? await this.query('UPDATE question_set SET ? WHERE id = ?', [{ name, url }, id ])
                        : await this.query('INSERT INTO question_set SET ?', { name, url });

        return id || result.insertId;
    }

    async _saveTournament({ name, url, host, address, tournament_date, question_set_id, type }) {  
        const result = await this.query('INSERT INTO tournament SET ?', { name, url, host, address, tournament_date, question_set_id, type });

        return result.insertId;
    }

    async _saveRound({ name, packet, tournament_id }) {  
        const result = await this.query('INSERT INTO round SET ?', { name, packet, tournament_id });

        return result.insertId;
    }   
    
    async _saveGame({ scoreline, tossups_read, round_id, forfeit }) {  
        const result = await this.query('INSERT INTO game SET ?', { scoreline, tossups_read, round_id, forfeit });

        return result.insertId;
    }
    
    async _saveTeam({ name, school_id, tournament_id, is_dii, is_ug }) {  
        const result = await this.query('INSERT INTO team SET ?', { name, school_id, tournament_id, is_dii, is_ug });

        return result.insertId;
    }

    async _saveTeamGame({ team_id, game_id, points, bonuses_heard, bonus_points, won }) {  
        const result = await this.query('INSERT INTO team_game SET ?', { team_id, game_id, points, bonuses_heard, bonus_points, won });

        return result.insertId;
    }

    async _updateTeamSchool(id, schoolId) {
        const result = await this.query('UPDATE team SET school_id = ? WHERE id = ?', [ schoolId, id ]);

        return result.insertId;
    }

    async _updatePlayerTeamPlayer(playerTeamId, playerId) {
        const result = await this.query('UPDATE player_team SET player_id = ? WHERE id = ?', [ playerId, playerTeamId ]);

        return result.insertId;
    }

    async _getSchoolId(teamName, { name, host, address, type }) {
        let preparedSearchName = this._handleSpecialSchoolCases(this._prepareTeamNameForSearch(teamName), name, host, address);
        const result = await this.query('CALL find_school_by_team_name(?, ?)', [ preparedSearchName, type ]);

        return result[0][0].out_school_id || null;
    }

    _prepareTeamNameForSearch(teamName) {
        teamName = teamName
            .replace(/\(.*\) /g, "")
            .replace(/ [a-zA-Z]( |$)/, "*~*")
            .replace(/ [IV]{1,4}( |$)/, "*~*")
            .split("*~*")[0]
            .trim();
        
        return `${teamName}`;
    }

    _preparePlayerNameForSearch(playerName) {
        // playerName = playerName.replace(/".*"/g, "") || playerName;

        // playerName = playerName
        //     .replace(/ ([a-zA-Z])-/g, " $1%-")
        //     .trim();
        
        return playerName;        
    }

    _preparePlayerNameForSave(playerName) {
        playerName = playerName.replace(/".*"/g, "") || playerName;
        playerName = playerName.replace(/\(.*\)/g, "") || playerName;

        playerName = playerName
            .replace(/[^\w\s-']/g, "")
            .trim();
        
        return playerName;        
    }    

    _handleSpecialSchoolCases(schoolName, tournamentName, host, address) {
        if (schoolName.includes("House")) {
            schoolName = host;
        } else if (schoolName === "Carleton") {
            if (host?.includes("Carleton University") || address?.includes("Canada"))
                schoolName = "Carleton%University";
            else
                schoolName = "Carleton%College";
        } else if (schoolName === "OSU") {
            if (host?.includes("Oklahoma") || address?.includes("Oklahoma"))
                schoolName = "Oklahoma%State";
            else
                schoolName = "Ohio%State";
        // handle Oxford's and Cambridge's colleges
        } else if (tournamentName.includes("ICQ") && !schoolName.includes("Brookes")) {
            schoolName = "Oxford";
        } else if (tournamentName.toLowerCase().includes("collegiate quiz")) {
            if (host.includes("Magdalene") || tournamentName.includes("Cambridge"))
                schoolName = "Cambridge";
            else
                schoolName = "Oxford";
        } else if (schoolName.includes("Oxford")) {
            schoolName = "Oxford";
        } else if (schoolName.includes("Cambridge")) {
            schoolName = "Cambridge";
        }

        return schoolName;
    }

    async _getPlayerId(playerName, schoolId, tournamentId) {
        playerName = this._preparePlayerNameForSearch(playerName);
        const result = await this.query('CALL find_player_by_name_school_and_tournament(?, ?, ?)', [ playerName, schoolId, tournamentId ]);

        return result[0][0].out_player_id || null;
    }

    async _savePlayer({ name }) {  
        const result = await this.query('INSERT INTO player SET ?', { name });

        return result.insertId;
    }

    async _savePlayerTeam({ player_id, team_id, name_in_stats }) {  
        const result = await this.query('INSERT INTO player_team SET ?', { player_id, team_id, name_in_stats });

        return result.insertId;
    }   
    
    async _savePlayerGame({ player_id, game_id, super_powers, powers, gets, negs, points, tossups_heard }) {  
        const result = await this.query('INSERT INTO player_game SET ?', { player_id, game_id, super_powers, powers, gets, negs, points, tossups_heard });

        return result.insertId;
    }  
}