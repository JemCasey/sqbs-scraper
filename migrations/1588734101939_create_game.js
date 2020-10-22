module.exports = {
    "up": `
        CREATE TABLE game (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            scoreline VARCHAR(500) NOT NULL,
            tossups_read INT,
            round_id INT(6) UNSIGNED NOT NULL,
            forfeit BIT,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX game_round_index (round_id),
            
            FOREIGN KEY (round_id) 
                REFERENCES round(id)
                ON DELETE CASCADE               
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;     
    `,
    "down": "DROP TABLE game;"
}