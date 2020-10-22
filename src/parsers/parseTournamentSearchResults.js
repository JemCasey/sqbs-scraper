import rp from 'request-promise';
import $ from 'cheerio';
import { BASE_URL } from '../constants';

const parseTournamentSearchResults = async function (searchTerm, level, startDate, endDate) {
	var tournamentIds = [], i;
	var dateQuery = startDate && endDate ? `&dates=between&startdate=${startDate}&enddate=${endDate}` : "";
	var html = await rp(`${BASE_URL}tournaments/search/1/?name=${searchTerm}&level=${level}${dateQuery}`);	
	var pageCount = parseInt($('.PageSelector li', html).last().prev().text()) || 1;

	for (i = 1; i <= pageCount; i ++) {
		var html = await rp(`${BASE_URL}tournaments/search/${i}/?name=${searchTerm}&level=${level}${dateQuery}`);
		var lis = $('.TournamentResults li', html);
		var levels = [];
		var levelsRegex = '';
		
		levelsRegex = new RegExp(levels.join("|"));
	
		lis.each(function (_, v) {
			tournamentIds.push($(v).find('a').attr('href').split('/')[1]);
		});
	}

	return tournamentIds;
}

export default parseTournamentSearchResults;