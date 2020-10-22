module.exports = {
    "up": `
        CREATE TABLE team (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            school_id INT(6) UNSIGNED NULL,
            tournament_id INT(6) UNSIGNED NOT NULL,
            is_dii BIT NULL,
            is_ug BIT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX team_school_index (school_id),
            
            FOREIGN KEY (school_id)
                REFERENCES school(id),            
            
            INDEX team_tournament_index (tournament_id),
            
            FOREIGN KEY (tournament_id)
                REFERENCES tournament(id)       
                ON DELETE CASCADE             
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;    
    `,
    "down": "DROP TABLE team;"
}