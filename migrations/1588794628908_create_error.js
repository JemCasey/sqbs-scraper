module.exports = {
    "up": `
        CREATE TABLE error (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            tournament_slug VARCHAR(10) NULL,
            message VARCHAR(500) NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP                                
        ) ENGINE=InnoDB;     
    `,
    "down": "DROP TABLE error"
}