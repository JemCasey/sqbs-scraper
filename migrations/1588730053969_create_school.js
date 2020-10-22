module.exports = {
    "up": `
        CREATE TABLE school (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            short_name VARCHAR(50) NULL,
            type VARCHAR(25) NOT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            UNIQUE INDEX school_full_name_unique_index (full_name),         
            FULLTEXT school_name_fulltext_idx (full_name, short_name)
        ) ENGINE=InnoDB;
    `,
    "down": `
        DROP TABLE school;
    `
}