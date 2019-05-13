# sqbs-scraper

Sqbs-scraper is a Node.js CLI for transforming quizbowl stats data from SQBS reports hosted on [hsquizbowl.org](https://hsquizbowl.org/) into readable .json files.

## Set up

After cloning the repo, cd to root folder and execute:

```bash
npm install
```

## Usage

Execute the following command:
```bash
npm install
```
For a list of available commands.
```bash
Usage: sqbs-scraper [options] [command]

Tool for scraping sqbs stats off hsquizbowl.org

Options:
  -V, --version                                                                      output the version number
  -h, --help                                                                         output usage information

Commands:
  scrapeSearchResults|s [options] <searchTerm> <firstPage> <pageCount> <outputFile>  Scrape hsquizbowl.org search results
  parseTournamentPage|p <tournamentId> <outputFile>                                  Parse tournament of specified id (find in url)
```

Help details for scrapeSearchResults:
```bash
Usage: scrapeSearchResults|s [options] <searchTerm> <firstPage> <pageCount> <outputFile>

Scrape hsquizbowl.org search results

Options:
  -h, --includeHighSchool    Include high school tournaments
  -c, --includeCollege       Include found college tournaments
  -m, --includeMiddleSchool  Include found middle school tournaments
  -o, --includeOpen          Include found open tournaments
  -t, --includeTrash         Include found trash tournaments
  -a, --includeAll           Include all found tournaments
  -h, --help                 output usage information
```
```bash
Usage: parseTournamentPage|p [options] <tournamentId> <outputFile>

Parse tournament of specified id (find in url)

Options:
  -h, --help  output usage information
```