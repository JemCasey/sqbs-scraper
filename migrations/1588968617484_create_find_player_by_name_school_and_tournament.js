module.exports = {
    "up": `
    CREATE PROCEDURE find_player_by_name_school_and_tournament
    (
        IN  param_player_name VARCHAR(250),
        IN  param_school_id INT(6) UNSIGNED,
        IN  param_tournament_id INT(6) UNSIGNED
    )
    BEGIN
        DECLARE out_player_id INT;
        SET @tournament_date = (SELECT tournament_date FROM tournament where id = param_tournament_id);
        SET @tournament_school_year = YEAR(DATE_ADD(@tournament_date, INTERVAL -8 MONTH));
        SET @full_name = IF(param_player_name LIKE '% %', true, false);
        
        IF param_school_id IS NULL AND @full_name = true THEN
            SET     out_player_id = (SELECT player.id
            FROM	player          
            WHERE	MATCH(player.name) AGAINST (param_player_name IN NATURAL LANGUAGE MODE)
            LIMIT 1);
        ELSE
            -- find player with matching name who has played for school
            SET 	out_player_id = (SELECT player.id
            FROM	player
            JOIN	player_team ON player.id = player_team.player_id
            JOIN	team ON team_id = team.id
            WHERE	MATCH(player.name) AGAINST (param_player_name IN NATURAL LANGUAGE MODE)
                AND	team.school_id = param_school_id
            LIMIT 1);
            
            -- if a player of this name hasn't played for given school before,
            -- and player has full name
            -- look for player of matching name who hasn't played for another school this school year
            IF out_player_id IS NULL AND @full_name = true THEN
                SET     out_player_id = (SELECT player.id
                FROM	player
                JOIN	player_team ON player.id = player_team.player_id
                JOIN	team ON team_id = team.id
                JOIN	tournament ON team.tournament_id = tournament.id        
                WHERE	MATCH(player.name) AGAINST (param_player_name IN NATURAL LANGUAGE MODE)
                GROUP BY player.id
                HAVING	
                    SUM(CASE
                        WHEN team.school_id <> param_school_id
                            AND	@tournament_school_year = YEAR(DATE_ADD(tournament.tournament_date, INTERVAL -8 MONTH)) 
                        THEN 1
                        ELSE 0
                    END) = 0
                LIMIT 1);            
            END IF;
        END IF;
        
        SET @player_already_found_count = (
            SELECT  COUNT(*)
            FROM	player
            JOIN	player_team ON player.id = player_team.player_id
            JOIN	team ON team_id = team.id
            JOIN	tournament ON team.tournament_id = tournament.id
            WHERE   player.id = out_player_id
                AND tournament.id = param_tournament_id
        );

        SET out_player_id = IF(@player_already_found_count > 0, NULL, out_player_id);

        SELECT out_player_id;
    END  
    `,
    "down": "DROP PROCEDURE find_player_by_name_school_and_tournament;"
}