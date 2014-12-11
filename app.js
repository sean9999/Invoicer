"use strict";

var finalhandler = require('finalhandler'),
	fs = require('fs'),
	http = require('http'),
	mimetypes = require('mimetypes.json'),
	router = require('./router'),
	fileExtension = function(){
		return this.url.split('.').pop();
	};

var server = http.createServer(function (req, res) {
	var done = finalhandler(req, res);
	var path_fragments = req.url.split('/').filter(function(frag){ return frag; });
	if (!(0 in path_fragments)) {
		path_fragments[0] = 'index.html';
		req.url = '/index.html';
	}
	switch (path_fragments[0]) {
		case 'datas':
		case 'foo':
		router(path_fragments,req,res);
		break;
		case 'bower_components':
		fs.readFile('.'+req.url, function (err, buf) {
			if (err) return done(err);
			res.setHeader('Content-Type', mimetypes[fileExtension.call(req)] );
			res.end(buf);
		});
		break;
		default:
		fs.readFile('./app'+req.url, function (err, buf) {
			if (err) return done(err);
			res.setHeader('Content-Type', mimetypes[fileExtension.call(req)] );
			res.end(buf);
		});
	}
});

server.listen(7777);
