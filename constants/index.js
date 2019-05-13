module.exports = Object.freeze({
	PLAYER_REGEX: /([^\(\d]*)(?: (\([A-Za-z2.]+\)))?([\-0-9 ]+)/,
	SCORELINE_FORFEIT_REGEX: /(?:.+: )?(.+) (defeats) (.+) by forfeit/,
	SCORELINE_REGEX: /(?:.+: )?(.+) ([0-9\-]+), (.+) ([0-9\-]+)/,
	BONUS_LINE_REGEX: /Bonuses: (.+) ([0-9]+) ([0-9.]+) ([0-9.]+), (.+) ([0-9]+) ([0-9.]+) ([0-9.]+)/,
	MATCH_RESULTS_REGEX: /Round ([0-9]+)(?: \(Packet: (.+)\))?/,
	BASE_URL: 'http://hsquizbowl.org/db/'
});