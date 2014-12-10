"use strict";

var sql = require('sqlite3').verbose();
var r =[];

var conn = {};

var dbz = {};

module.exports = {
	load: function(paths) {
		//	run queries
		paths.forEach(function(path){
			dbz[path] = new sql.Database(path,sql.OPEN_READONLY);
			dbz[path].serialize(function() {
				dbz[path].all('SELECT * FROM `fs`',function(err,rows){
					if (err) {
						console.error(err);
					} else {
						r.push(rows);	
					}
					dbz[path].close();
				});
			});
		});
		return this;
	},
	transform: function(fn){
		r = r.map(fn);
		return this;
	},
	output: function(){
		return r;
	}
};