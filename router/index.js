"use strict";

module.exports = function(frags,req,res){

	var prefix = frags.shift();	//	"datas"

	if (0 in frags) {
		//	load the sub-router with the first path fragment shifted off
		return require( __dirname + '/' + prefix + '/' + frags.shift() )(frags,req,res);
	} else {
		//	return an index of available resources
		//	@todo: check to see how to do this properly acccording to REST principals
		var links = [
			'/datas/git',
			'/datas/fs'
		];
		res.end( JSON.stringify(links) );
	}
};
