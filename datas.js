"use strict";

//var os = require('os');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('data/macmini.sqlite3');

var o = [];

db.each(
	"SELECT * FROM fs",
	function(err,row){
		o.push(row);
	},
	function(err,numRows) {
		console.log( JSON.stringify(o) );
	}
);
