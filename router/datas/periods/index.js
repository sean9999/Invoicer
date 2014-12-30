"use strict";

var Repo = require('git-tools');
var repo = new Repo( '/Users/seanmacdonald/REPOS/numops/' );
var AUTHOR_REGEX = 'crazyhorsecoding';
var uuid = require('node-uuid');

var mimetypes = require('mimetypes.json');
var sql = require('sqlite3');
var db_paths = [ './data/all.sqlite3' ];
var dbz = {};
var allrecords = [];

var shortMonths = [
	'Jan','Feb','March','April','May','June','July','Aug','Sep','Oct','Nov','Dec'
];

/**
 * get all records from `fspruned` table of 1 or more sqllite databases
 * @param  {Function} cb The callback to execute once we have the data
 * @return {void}      returns nothing. That's why we pass in a callback
 */
function withAllRecords(cb) {
	db_paths.forEach(function(path,i){
		dbz[path] = new sql.Database(path,sql.OPEN_READONLY);
		dbz[path].serialize(function() {
			dbz[path].all('SELECT * FROM `fspruned`',function(err,rows){
				if (err) {
					console.error(err);
				} else {
					allrecords = allrecords.concat(rows);
					if (i === db_paths.length-1) {
						allrecords.sort( function(a,b) {
							if (a.ts < b.ts) return -1; else if (a.ts > b.ts) return 1; else return 0;
						});
						cb(allrecords);
					}
				}
				dbz[path].close();
			});
		});
	});
}

/**
 * Same as withAllRecords, but with a date range
 * @see whithAllRecords()
 */
function withRecordsBetween(cb,startDate,endDate) {
	db_paths.forEach(function(path,i){
		dbz[path] = new sql.Database(path,sql.OPEN_READONLY);
		dbz[path].serialize(function() {
			dbz[path].all('SELECT * FROM `fspruned` WHERE ts >= ' + startDate + ' AND ts < ' + endDate,function(err,rows){
				if (err) {
					console.error(err);
				} else {
					allrecords = allrecords.concat(rows);
					if (i === db_paths.length-1) {
						cb(allrecords);
					}
				}
				dbz[path].close();
			});
		});
	});
}

/**
 * Take `git log`, and return nicely formatted objects
 * @param  {String} huge string as returned by `git log`
 * @return {Array}  of nicely formatted objects representing each commit
 */
var formatCommits = function(result){
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
	});
	return nicecommits;
}

"use strict";

module.exports = function(frags,req,res) {
	if (frags.length) {
		//	sub-route
		return require( __dirname + '/' + frags.shift() )(frags,req,res);
	} else {
		//	index
		var index = [
			'/datas/periods/foo',
			'/datas/periods/wonk'
		];
		res.end( JSON.stringify(index) );
	}
}
