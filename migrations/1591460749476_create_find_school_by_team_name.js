module.exports = {
    "up": `
    CREATE PROCEDURE find_school_by_team_name
    (
        IN  param_team_name VARCHAR(250)
    )
    BEGIN
        DECLARE out_school_id INT;
            
        SET out_school_id = (
            SELECT	school.id
            FROM	school
            LEFT JOIN school_alias on school.id = school_id
            WHERE	full_name = param_team_name
                OR	short_name = param_team_name
                OR	name = param_team_name
            LIMIT 1
        );
        
        IF out_school_id IS NULL THEN
            SET out_school_id = (
                SELECT  school.id
                FROM    school
                WHERE   MATCH (full_name, short_name) AGAINST (param_team_name IN NATURAL LANGUAGE MODE)
                LIMIT 1
            );
        END IF;
        
        IF out_school_id IS NULL THEN
            SET out_school_id = (
                SELECT  school_id
                FROM    school_alias
                WHERE   MATCH (name) AGAINST (param_team_name IN NATURAL LANGUAGE MODE)
                LIMIT 1
            );
        END IF;

        SELECT out_school_id;
    END  
    `,
    "down": "DROP PROCEDURE find_school_by_team_name;"
}