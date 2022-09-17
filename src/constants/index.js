module.exports = Object.freeze({
	PLAYER_REGEX: /([^\(\d]*)(?: (\([A-Za-z2.]+\)))?([\-0-9 ]+)/,
	SCORELINE_FORFEIT_REGEX: /(?:.+: )?(.+) (defeats) (.+) by forfeit/,
	// SCORELINE_REGEX: /(?:.+: ?)?(.+) ([0-9\-]+), (.+) ([0-9\-]+)/,
	SCORELINE_REGEX: /(.+) (\-?[0-9]*[05]), (.+) (\-?[0-9]*[05])/,
	BONUS_LINE_REGEX: /Bonuses: (.+) ([0-9]+) ([0-9.]+) ([0-9.]+), (.+) ([0-9]+) ([0-9.]+) ([0-9.]+)/,
	MATCH_RESULTS_REGEX: /(Round [0-9]+)(?: \(Packet: (.+)\))?/,
	BASE_URL: 'http://hsquizbowl.org/db/',
	QUIZDB_URL: 'https://www.quizdb.org/api/filter_options',
	WIKIPEDIA_COLLEGE_NAMES_URL: 'https://en.wikipedia.org/wiki/List_of_colloquial_names_for_universities_and_colleges_in_the_United_States',
	NAQT: {
		BASE_URL: 'https://www.naqt.com/stats/',
		COLLEGE_AUDIENCE_ID: 1004
	},
	NEG5: {
		BASE_URL: 'https://stats.neg5.org/neg5-api/tournaments'
	}
});