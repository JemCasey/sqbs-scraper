export const getTeamsWithNoSchool = `
    SELECT  t.*,
            tournament.name AS tournament_name,
            host,
            address
    FROM    team t
    JOIN    tournament ON tournament_id = tournament.id
    WHERE   t.school_id IS NULL
`;

export const getPlayerTeamsWithNoPlayer = `
    SELECT  player_team.id AS id,
            name_in_stats AS name,
            school_id,
            tournament_id
    FROM    player_team
    JOIN    team ON team_id = team.id
    JOIN    tournament on tournament_id = tournament.id
    WHERE   player_id IS NULL
    ORDER BY tournament_date ASC
`;