"use strict";

var docroot = require('docroot');
var Repo = require('git-tools');
var repo = new Repo( '/Users/seanmacdonald/REPOS/numops/' );

module.exports = function(frags,req,res){
	var spit = function(err,result){
		res.end(JSON.stringify(result));
	}
	repo.activeDays( spit );
}
