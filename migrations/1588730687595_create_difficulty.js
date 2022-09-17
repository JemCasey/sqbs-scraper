module.exports = {
    "up": `
        CREATE TABLE difficulty (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            order INT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP        
        )
    `,
    "down": `
        DROP TABLE difficulty;
    `
}