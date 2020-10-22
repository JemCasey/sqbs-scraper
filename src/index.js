import program from 'commander';
import Scraper from './Scraper';
import { getConnection } from './db';
import TournamentService from './services/TournamentService';
import ErrorService from './services/ErrorService';
import SchoolService from './services/SchoolService';
import difficultyService from './services/DifficultyService';

var connection = getConnection();
var scraper = new Scraper({
	tournamentService: new TournamentService(connection),
	errorService: new ErrorService(connection),
	schoolService: new SchoolService(connection),
	difficultyService: new difficultyService(connection)	
});
 
program
	.version('0.0.1')
	.description('Tool for scraping sqbs stats off hsquizbowl.org');

program
.command('scrapeStatsUrl <url> [tournamentName] [date]')
.alias('i')
.description("Get stats from url")
.action(async (url, tournamentName, date) => {	
	await scraper.scrapeStatsUrl(url, tournamentName, date);
	closeConnection();
});

program
	.command('scrapeRange <firstId> <lastId>')
	.option('-h, --hs', 'Include high school tournaments', false)
	.option('-c, --college', 'Include college tournaments', false)
	.option('-m, --ms', 'Include middle school tournaments', false)
	.option('-o, --open', 'Include open tournaments', false)
	.option('-t, --trash', 'Include trash tournaments', false)
	.option('-a, --all', 'Include all tournaments', false)
  .alias('s')
  .description('Scrape hsquizbowl.org search results')
  .action(async (firstId, lastId, cmd) => {
	firstId = parseInt(firstId);
	lastId = parseInt(lastId);

	await scraper.scrapeRange(firstId, lastId, cmd);
	closeConnection();	
  });

program
  .command('scrapeSearchQuery <searchTerm> [level] [startDate] [endDate]')
  .alias('q')
  .description('Scrape search results with query')
  .action(async (searchTerm, level, startDate, endDate) => {	
	  await scraper.scrapeSearchQuery(searchTerm, level, startDate, endDate);
	  closeConnection();
  }); 

program
  .command('scrapeUniversities <startYear> <endYear>')
.alias('u')
.description('Scrape university data from naqt.com and wikipedia.org')
.action(async (startYear, endYear) => {	
	startYear = parseInt(startYear);
	endYear = parseInt(endYear);
	
	await scraper.scrapeUniversities(startYear, endYear);
	closeConnection();
});  

program
.command('scrapeDifficulties')
.alias('d')
.description("Use quizdb's API to populate question set difficulties")
.action(async () => {	
	await scraper.scrapeDifficulties();
	closeConnection();
});

program
.command('fixTeamSchools')
.alias('t')
.description('Try to match school-less teams to schools')
.action(async () => {	
	await scraper.fixTeamSchools();
	closeConnection();
}); 

program
.command('fixPlayers')
.alias('p')
.description('Link player_team records to players')
.action(async () => {	
	await scraper.fixPlayers();
	closeConnection();
}); 

program
.command('loadNeg5Stats <tournamentId>')
.alias('p')
.description('Load Neg5 Stats')
.action(async (tournamentId) => {	
	await scraper.loadNeg5Stats(tournamentId);
	closeConnection();
}); 

function closeConnection() {
	connection.end(function (err) {
		console.log(err || "DB connection closed successfully!");
	});	
}

program.parse(process.argv);