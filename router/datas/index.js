"use strict";

module.exports = function(frags,req,res){
	//	load the sub-router with the first path fragment shifted off
	return require( './' + frags.shift() )(frags,req,res);
};
