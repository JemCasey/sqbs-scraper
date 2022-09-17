import util from 'util';
import rp from 'request-promise';

export default class PlayerService {
	constructor(connection) {
        this.connection = connection;
        this.query = util.promisify(connection.query).bind(connection);
        this.offset = 0;
    }

    async getNewPlayers() {
        const players = await this.query(`
        SELECT  player.id
        FROM    player
        WHERE   
            -- (player.name not like '% %'
            -- OR  LENGTH(player.name) - POSITION(' ' in player.name) <= 1) AND
            player.last_modified > '2022-06-00 00:00:00';`);
        var results = [];
        
        for (var player of players) {
            let playerDetails = await this.query(`
            SELECT  player.id as player_id, 
                    player.name as player_name,
                    team.id as team_id,
                    team.name as team_name,
                    school_id,
                    tournament_id,
                    tournament.name as tournament_name,
                    tournament.url,
                    tournament.host,
                    tournament.tournament_date,
                    (
                        SELECT  GROUP_CONCAT(distinct p.name) 
                        FROM    player p
                        JOIN    player_team on p.id = player_id
                        WHERE   team_id = team.id
                            AND p.id <> player.id
                    ) AS teammates,
                    sum(points),
                    sum(tossups_heard)
            FROM    player
            JOIN    player_team ON player.id = player_team.player_id
            JOIN    player_game ON player.id = player_game.player_id
            JOIN	team ON team_id = team.id
            JOIN	tournament on tournament_id = tournament.id
            WHERE   player.id = ${player.id}
            GROUP BY player.id, 
                player.name,
                team.id,
                team.name, 
                tournament.name,
                tournament.host,
                tournament.tournament_date;
            `);
    
            this.offset ++;
            var matchOptions = [];
    
            matchOptions.push(...(
                await this.query(`
                    SELECT  p.id,
                            p.name
                    FROM    player p
                    JOIN    player_game on p.id = player_id
                    WHERE   p.name like CONCAT(?, '%') 
                        AND p.id <> ?
                    GROUP BY p.id
                    ORDER BY count(*) desc
                    LIMIT 4
                `, [ playerDetails[0].player_name, playerDetails[0].player_id])
            ));
    
            matchOptions.push(...(
                await this.query(`
                    SELECT  player.id, player.name
                    FROM    player
                    WHERE   MATCH (name) AGAINST (? IN NATURAL LANGUAGE MODE)
                        AND id <> ?
                    LIMIT 4
                `, [ playerDetails[0].player_name, playerDetails[0].player_id])
            ));
    
            if (playerDetails[0].school_id) {
                const result = await this.query('CALL find_player_by_name_school_and_tournament(?, ?, ?)', [ playerDetails[0].player_name, playerDetails[0].school_id, playerDetails[0].tournament_id ]);
                const playerMatchId = result[0][0].out_player_id;
    
                if (playerMatchId && playerMatchId !== player.id) {
                    matchOptions.push(...(
                        await this.query(`
                        SELECT  player.id, player.name
                        FROM    player
                        WHERE   id = ?
                        `, [ playerMatchId ])
                    ));              
                }
            }

            results.push({
                id: player.id,
                playerDetails: playerDetails[0],
                matchOptions
            });
        }

        return {
            results: results
        };
    }

    async mergePlayersByIds(mergeFrom, mergeTo) {
        await this.query('CALL merge_players_by_ids(?, ?)', [mergeFrom, mergeTo]);
        return true;
    }
}