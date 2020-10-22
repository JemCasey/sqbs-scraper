module.exports = {
    "up": `
        CREATE TABLE team_game (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id INT(6) UNSIGNED NOT NULL,
            game_id INT(6) UNSIGNED NOT NULL,
            points INT,
            bonuses_heard INT,
            bonus_points INT,
            won BIT,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            UNIQUE INDEX team_game_index (team_id, game_id),

            FOREIGN KEY (team_id) 
                REFERENCES team(id),

            FOREIGN KEY (game_id)
                REFERENCES game(id)  
                ON DELETE CASCADE                              
        ) ENGINE=InnoDB;     
    `,
    "down": "DROP TABLE team_game;"
}