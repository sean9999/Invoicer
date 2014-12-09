"use strict";

var finalhandler = require('finalhandler');
var fs = require('fs');
var http = require('http');
var mimetypes = require('./mimetypes.json');

var extension = function(){
	return this.url.split('.').pop();
};

var server = http.createServer(function (req, res) {
	var done = finalhandler(req, res);

	switch (req.url) {

		case '/datas':
		//	grap all the SQLs you can, and pump them into a JSON stream
		res.end( 'hi nerd!' );
		break;

		default:
		fs.readFile('./app'+req.url, function (err, buf) {
			if (err) return done(err);
			res.setHeader('Content-Type', mimetypes[extension.call(req)] );
			res.end(buf);
		});
	}
});

server.listen(3456);
