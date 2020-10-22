module.exports = {
    "up": `
        CREATE TABLE question_set (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(250) NOT NULL,
            difficulty_id INT(6) UNSIGNED NULL,
            url VARCHAR(250),
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX question_set_difficulty_index (difficulty_id),

            UNIQUE INDEX question_set_url_index (url),

            FOREIGN KEY (difficulty_id) 
                REFERENCES difficulty(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB;  
    `,
    "down": `
        DROP TABLE question_set;
    `
}