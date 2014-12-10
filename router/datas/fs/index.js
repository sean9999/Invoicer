"use strict";

var mimetypes = require('mimetypes.json');
var sql = require('sqlite3');
var db_paths = [
	'./data/macmini.sqlite3',
	'./data/retina.2.logz.sqlite3',
	'./data/retina1.logz.sqlite3'
];
var dbz = {};
var allrecords = [];

var shortMonths = [
	'Jan','Feb','March','April','May','June','July','Aug','Sep','Oct','Nov','Dec'
];

function withAllRecords(cb) {
	db_paths.forEach(function(path,i){
		dbz[path] = new sql.Database(path,sql.OPEN_READONLY);
		dbz[path].serialize(function() {
			dbz[path].all('SELECT * FROM `fs`',function(err,rows){
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

module.exports = function(frags,req,res) {

	//	let's assume we're returning JSON in all cases
	res.setHeader('Content-Type', mimetypes['json']);

	if (!(0 in frags)) {
		frags[0] = 'index';
	}

	switch (frags[0]) {

		case 'index':
		case 'raw':
		case 'dump':
		withAllRecords(function(allrecords){
			res.end(JSON.stringify(allrecords));
		});
		break;

		case 'hits':
		withAllRecords(function(allrecords){
			var r = allrecords.map(function(record){ return record.ts; });
			r.sort();
			//	prepend meta-data
			var lowest_value = r.reduce(function(a,b){
				if (a < b) {
					return a;
				} else {
					return b;
				}
			});
			var highest_value = r.reduce(function(a,b){
				if (a > b) {
					return a;
				} else {
					return b;
				}
			});
			var startDate = new Date(lowest_value);
			var endDate = new Date(highest_value);
			startDate.setHours(6,0,0,0);
			endDate.setHours(23,0,0,0);
			var niceBottom = startDate.getTime();
			var niceTop = endDate.getTime();
			var first_row = {
				absoluteBottom: lowest_value,
				absoluteTop: highest_value,
				niceBottom: niceBottom,
				niceTop: niceTop,
				goodBinNumber: Math.ceil( ( niceTop - niceBottom ) / (1000*60*60*24) )
			};
			r.unshift(first_row);
			res.end( JSON.stringify(r) );
		});
		break;

		case 'counts':
		withAllRecords(function(allrecords){
			var crunchedFiles = [];	// {file:file, count: n}
			allrecords.forEach(function(record){
				var thisfilename = record.filepath;
				var n = -1;
				if (crunchedFiles.some(function(crunched){ return (thisfilename === crunched.file); })) {
					//	file has already been crunched. Nothing to do
				} else {
					//	new file, let's go crunch it
					n = allrecords.filter(function(rec){
						return (rec.filepath === thisfilename);
					}).length;
					crunchedFiles.push({
						file: thisfilename,
						n: n
					});
				}
			});
			crunchedFiles.sort(function(a,b){
				if (a.n > b.n) {
					return -1;
				} else if (a.n < b.n) {
					return 1;
				} else {
					return 0;
				}
			});
			res.end( JSON.stringify(crunchedFiles) );
		});
		break;

		case 'timeseries':
		switch (frags[1]) {
			case 'hourly':
			var r = [];
			var bin_size = (1000 * 60 * 60);
			var formatter = function(thedate) {
				var r = shortMonths[thedate.getMonth()] + ' ' + thedate.getDate() + ', ' + thedate.getHours() + ':00';
				return r;
			};
			withAllRecords(function(allrecords){
				var earliest_record = allrecords.reduce(function(a,b){
					if (a.ts < b.ts) {
						return a;
					} else {
						return b;
					}
				});
				var latest_record = allrecords.reduce(function(a,b){
					if (a.ts > b.ts) {
						return a;
					} else {
						return b;
					}
				});
				var earliest_date = new Date( earliest_record.ts );
				var latest_date = new Date( latest_record.ts );
				//	6am the day of the first event
				var start_date = new Date(
					earliest_date.getFullYear(),
					earliest_date.getMonth(),
					earliest_date.getDate()
				);
				start_date.setHours(6);
				//	11pm the day of the last event
				var end_date = new Date(
					latest_date.getFullYear(),
					latest_date.getMonth(),
					latest_date.getDate()
				);
				end_date.setHours(23);
				var thisdate = start_date;
				while (thisdate < end_date) {
					var z = thisdate.getTime();
					var f = formatter(thisdate);
					var hits = allrecords.filter(function(rec){
						var is_in_range = false;
						if (rec.ts >= z && rec.ts < z+bin_size) {
							is_in_range = true;
						}
						return is_in_range;
					}).length;
					r.push({
						z: z,
						f: f,
						n: hits
					});
					thisdate.setHours( thisdate.getHours() + 1 );
				}
				res.end( JSON.stringify(r) );
			});
			break;
		}
		break;

		case 'test':

		break;

		default:
		res.setHeader('Content-Type', mimetypes['html'] );
		res.end('<h1>404</h1><p>yo. like not found</p>');
		break;

	}

	/*
	res.end( JSON.stringify(sqlite2json.output()) );
	*/


};