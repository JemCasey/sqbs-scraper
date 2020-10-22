module.exports = {
    "up": `
        INSERT INTO tournament_blacklist SET url='https://hsquizbowl.org/db/tournaments/886'; -- weird practice stats
        INSERT INTO tournament_blacklist SET url='https://hsquizbowl.org/db/tournaments/3033'; -- stats are all messed up for this one`,
    "down": "DELETE FROM tournament_blacklist"
}