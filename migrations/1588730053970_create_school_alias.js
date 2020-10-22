module.exports = {
    "up": `
        CREATE TABLE school_alias (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            school_id INT(6) UNSIGNED NOT NULL,
            name VARCHAR(50) NOT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX school_alias_school_index (school_id),
            
            UNIQUE INDEX school_alias_school_name_unique_index (school_id, name),
            
            FOREIGN KEY (school_id)
                REFERENCES school(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `,
    "down": `
        DROP TABLE school_alias;
    `
}