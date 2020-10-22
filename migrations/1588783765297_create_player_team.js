module.exports = {
    "up": `
        CREATE TABLE player_team (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            player_id INT(6) UNSIGNED NULL,
            team_id INT(6) UNSIGNED NOT NULL,
            year INT NULL,
            name_in_stats VARCHAR(250) NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            UNIQUE INDEX player_team_index (player_id, team_id),

            FOREIGN KEY (player_id) 
                REFERENCES player(id),

            FOREIGN KEY (team_id)
                REFERENCES team(id)  
                ON DELETE CASCADE                              
        ) ENGINE=InnoDB;     
    `,
    "down": "DROP TABLE player_team;"
}