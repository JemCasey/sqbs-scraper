module.exports = {
    "up": `
        CREATE TABLE round (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            packet VARCHAR(250) NULL,
            tournament_id INT(6) UNSIGNED NOT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX round_tournament_index (tournament_id),

            UNIQUE INDEX round_tournament_name_index (tournament_id, name),
            
            FOREIGN KEY (tournament_id)
                REFERENCES tournament(id)
                ON DELETE CASCADE                    
        ) ENGINE=InnoDB;     
    `,
    "down": "DROP TABLE round;"
}