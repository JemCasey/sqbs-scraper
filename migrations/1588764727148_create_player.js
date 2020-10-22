module.exports = {
    "up": `
        CREATE TABLE player (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(250),
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FULLTEXT player_name_fulltext_idx (name)
        ) ENGINE=InnoDB;      
    `,
    "down": "DROP TABLE player;"
}