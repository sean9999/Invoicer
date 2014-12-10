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
db_paths.forEach(function(path){
	dbz[path] = new sql.Database(path,sql.OPEN_READONLY);
});

module.exports = function(frags,req,res) {

	var r = [];

	res.setHeader('Content-Type', mimetypes['json']);

	if (!(1 in frags)) {
		frags[1] = 'index';
	}

	switch (frags[1]) {

		case 'index':
		case 'raw':
		db_paths.forEach(function(path){
			dbz[path].serialize(function() {
				dbz[path].all('SELECT * FROM `fs`',function(err,rows){
					if (err) {
						console.log(err);
					} else {
						r.push(rows);	
					}
					dbz[path].close();
				});
			});
		});

		console.log(r.length);

		(function(r){ setTimeout( console.log.bind(null,r.length) , 5000); })(r);

		res.end( JSON.stringify( r ) );	
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
