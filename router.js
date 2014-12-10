"use strict";

var sqlite2json = require('./sqlite2json.js');
var mimetypes = require('./mimetypes.json');
var sql = require('sqlite3').verbose();

//	connect to databases
var db_paths = [
	'./data/macmini.sqlite3',
	'./data/retina.2.logz.sqlite3',
	'./data/retina1.logz.sqlite3'
];
var dbz = {};

module.exports = function(frags,req,res) {

	var allrecords = [];

	res.setHeader('Content-Type', mimetypes['json']);

	if (!(1 in frags)) {
		frags[1] = 'index';
	}

	switch (frags[1]) {

		case 'index':
		case 'raw':
		case 'dump':
		db_paths.forEach(function(path,i){
			dbz[path] = new sql.Database(path,sql.OPEN_READONLY);
			dbz[path].serialize(function() {
				dbz[path].all('SELECT * FROM `fs`',function(err,rows){
					if (err) {
						console.log(err);
					} else {
						allrecords = allrecords.concat(rows);
						if (i === db_paths.length-1) {

							var smallest_val = allrecords.reduce(function(a,b){
								if (a.ts < b.ts) {
									return a;
								} else {
									return b;
								}
							});

							smallest_val.d = new Date( smallest_val.ts );

							var largest_val = allrecords.reduce(function(b,a){
								if (a.ts < b.ts) {
									return a;
								} else {
									return b;
								}
							});

							/*
							console.log('smallest val', new Date(smallest_val.ts));
							console.log('largest val', new Date(largest_val.ts));
							*/

							var xx = {
								smallest: smallest_val,
								largest: largest_val
							};

							res.end(JSON.stringify(xx));

							//res.end( JSON.stringify( r ) );
						}
					}
					dbz[path].close();
				});
			});
		});
		break;

		case 'timeseries':
		switch (frags[2]) {
			case 'hourly':

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
