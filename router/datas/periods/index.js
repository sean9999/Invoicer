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
