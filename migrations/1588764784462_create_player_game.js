module.exports = {
    "up": `
        CREATE TABLE player_game (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            player_id INT(6) UNSIGNED NOT NULL,
            game_id INT(6) UNSIGNED NOT NULL,
            super_powers INT NULL,
            powers INT NULL,
            gets INT NULL,
            negs INT NULL,
            points INT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            UNIQUE INDEX player_game_index (player_id, game_id),

            FOREIGN KEY (player_id) 
                REFERENCES player(id),

            FOREIGN KEY (game_id)
                REFERENCES game(id)   
                ON DELETE CASCADE                             
        ) ENGINE=InnoDB;     
    `,
    "down": "DROP TABLE player_game;"
}