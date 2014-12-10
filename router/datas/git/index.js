"use strict";

var docroot = require('docroot');
var Repo = require('git-tools');
var repo = new Repo( docroot );

module.exports = function(frags,req,res) {
	/*
	repo.activeDays(function( error, authors ) {
		res.end( JSON.stringify(authors) );
	});
	*/

	var spit = function(err,x){
		if (err) {
			console.log(err);
		}
		res.end(JSON.stringify([x]));
	}

	repo.exec('log', spit );

}
