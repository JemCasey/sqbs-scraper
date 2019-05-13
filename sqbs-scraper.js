const commander = require('commander');
const { scrapeSearchResults, parseTournamentPage } = require('./commands');

commander
  .version('0.0.1')
  .description('Tool for scraping sqbs stats off hsquizbowl.org');

commander
	.command('scrapeSearchResults <searchTerm> <firstPage> <pageCount> <outputFile>')
	.option('-h, --includeHighSchool', 'Include high school tournaments', false)
	.option('-c, --includeCollege', 'Include found college tournaments', false)
	.option('-m, --includeMiddleSchool', 'Include found middle school tournaments', false)
	.option('-o, --includeOpen', 'Include found open tournaments', false)
	.option('-t, --includeTrash', 'Include found trash tournaments', false)
	.option('-a, --includeAll', 'Include all found tournaments', false)
  .alias('s')
  .description('Scrape hsquizbowl.org search results')
  .action((searchTerm, firstPage, pageCount, outputFile, cmd) => {
		firstPage = parseInt(firstPage);
		pageCount = parseInt(pageCount);

    scrapeSearchResults({
			searchTerm,
			firstPage,
			pageCount,
			outputFile,
			includeHighSchool: cmd.includeHighSchool,
			includeCollege: cmd.includeCollege,
			includeMiddleSchool: cmd.includeMiddleSchool,
			includeOpen: cmd.includeOpen,
			includeTrash: cmd.includeTrash,
			includeAll: cmd.includeAll
		});
  });

commander
  .command('parseTournamentPage <tournamentId> <outputFile>')
  .alias('p')
  .description('Parse tournament of specified id (find in url)')
  .action((tournamentId, outputFile) => parseTournamentPage({ tournamentId, outputFile }));

commander.parse(process.argv);