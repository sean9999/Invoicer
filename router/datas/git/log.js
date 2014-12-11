"use strict";

var docroot = require('docroot');
var Repo = require('git-tools');
var repo = new Repo( '/Users/seanmacdonald/REPOS/numops/' );
var AUTHOR_REGEX = /crazyhorsecoding\.com/;

/**
 * return an array analogous to "git log"
 * @param  {Array} frags route fragments, split on the "/" char, but only those that matter to this submodule
 * @param  {Resource} req   built in node object (representing the HTTP request)
 * @param  {Resource} res   built in node object (representing the HTTP response)
 * @return {Array} (JSON encoded) of commits, including a timestamp value
 */
module.exports = function(frags,req,res){
	var spit = function(err,result){
		var rawcommits	= result.split(/\n\ncommit\s/g);
		var nicecommits = rawcommits.map(function(rawcommit){
			var lines	= rawcommit.split("\n").filter(function(line){ return (line.trim()) });
			var o = {
				txt: []
			};
			while (lines.length) {
				var thisline = lines.shift().trim();
				var pieces = thisline.match(/^(\w+)(:\s+)(.*)/);
				var k,v;
				if (pieces) {
					k = pieces[1].toLowerCase();
					v = pieces[3].trim();
					switch (k) {
						case 'date':
						o.ts = new Date( v ).getTime();
						default:
						o[k] = v;
					}
				} else {
					if ( /[a-f0-9]{40}/.test(thisline) ) {
						o['sha1'] = thisline.replace(/(.*)([a-f0-9]{40})(.*)/,'$2') || thisline;
					} else {
						o['txt'].push(thisline);
					}
				}
			}
			return o;
		}).filter(function(commit){
			return ( "author" in commit && AUTHOR_REGEX.test(commit.author) );
		});
		if (err) {
			console.log(err);
		}
		res.end(JSON.stringify(nicecommits));
	}
	repo.exec('log', spit );
}
