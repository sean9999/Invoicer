"use strict";

var finalhandler = require('finalhandler'),
	fs = require('fs'),
	http = require('http'),
	mimetypes = require('./mimetypes.json'),
	router = require('./router.js'),
	extension = function(){
		return this.url.split('.').pop();
	};


var server = http.createServer(function (req, res) {
	
	var done = finalhandler(req, res);

	var matches;

	var path_fragments = req.url.split('/').filter(function(frag){ return frag; });

	switch (path_fragments[0]) {

		case 'datas':
		router(path_fragments,req,res);
		break;

		default:
		fs.readFile('./app'+req.url, function (err, buf) {
			if (err) return done(err);
			//	set mimetype
			res.setHeader('Content-Type', mimetypes[extension.call(req)] );
			res.end(buf);
		});
	}
});

server.listen(7777);
