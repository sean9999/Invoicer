"use strict";

var finalhandler = require('finalhandler');

module.exports = function(frags,req,res){
	var prefix = frags.shift();	//	"datas"
	var done = finalhandler(req, res);
	if (0 in frags) {
		//	load the sub-router with the first path fragment shifted off
		try {
			require( __dirname + '/' + prefix + '/' + frags.shift() )(frags,req,res);
		} catch (e) {
			//res.end('er00r');
			done(e);
		}
	} else {
		//	return an index of available resources
		//	@todo: check to see how to do this properly acccording to REST principals (HATEOS, etc)
		var links = [
			'/datas/git',
			'/datas/fs'
		];
		res.end( JSON.stringify(links) );
	}
};
