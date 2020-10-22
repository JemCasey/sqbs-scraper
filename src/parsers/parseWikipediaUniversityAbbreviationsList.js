import rp from 'request-promise';
import $ from 'cheerio';
import { WIKIPEDIA_COLLEGE_NAMES_URL } from '../constants';
import { stripPunctuation } from '../utils';

const parseWikipediaUniversityAbbreviationsList = async function () {
    var html = await rp(WIKIPEDIA_COLLEGE_NAMES_URL);
    var universityMap = {};

    $('.mw-parser-output > ul li', html).each((_, v) => {
        var line = $(v).html().split(' &#x2013; ');
        var abbreviations = line[0].split(/ or | \/ /);

        $(`<div>${line[1]}</div>`).find('a').each((_, v) => {
            var fullName = $(v).text();
            universityMap[stripPunctuation(fullName)] = universityMap[stripPunctuation(fullName)] || [];
            universityMap[stripPunctuation(fullName)].push(...abbreviations.map(a => a.trim()));    
        });
    });

    return universityMap;
}

export default parseWikipediaUniversityAbbreviationsList;