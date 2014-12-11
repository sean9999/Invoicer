"use strict";

module.exports = function(frags,req,res) {
	if (frags.length) {
		//	sub-route
		return require( __dirname + '/' + frags.shift() )(frags,req,res);
	} else {
		//	index
		var index = [
			'/datas/git/log',
			'/datas/git/diff'
		];
		res.end( JSON.stringify(index) );
	}
}
