module.exports = {
    "up": `
        CREATE TABLE tournament_blacklist (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            url VARCHAR(250)                          
        ) ENGINE=InnoDB;  
    `,
    "down": "DROP TABLE tournament_blacklist;"
}