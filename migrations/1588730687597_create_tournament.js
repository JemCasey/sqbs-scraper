module.exports = {
    "up": `
        CREATE TABLE tournament (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            url VARCHAR(250) NOT NULL,
            host VARCHAR(50),
            address VARCHAR(250),
            tournament_date DATE,
            question_set_id INT(6) UNSIGNED NULL,
            type VARCHAR(11),
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX tournament_question_set_index (question_set_id),
            
            UNIQUE INDEX tournament_url_index (url),

            FOREIGN KEY (question_set_id)
                REFERENCES question_set(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB;    
    `,
    "down": `
        DROP TABLE tournament;
    `
}