"use strict";

var finalhandler= require('finalhandler'),
	fs 			= require('fs'),
	http 		= require('http'),
	mimetypes 	= require('mimetypes.json'),
	router 		= require('./router'),
	url 		= require('url'),
	fileExtension = function(){
		var r = null;
		var request = url.parse(this.url);
		if ( request.pathname.indexOf('.') > 0 ) {
			r = request.pathname.split('.').pop();
		}
		return r;
	},
	mimeType = function(ext) {
		if (ext in mimetypes) {
			return mimetypes[ext];
		}
	};

var server = http.createServer(function (req, res) {
	var done = finalhandler(req, res);
	var request = url.parse(req.url);
	var path_fragments = request.pathname.split('/').filter(function(frag){ return frag; });
	if (!(0 in path_fragments)) {
		path_fragments[0] = 'index.html';
		req.url = '/index.html';
	}
	switch (path_fragments[0]) {
		case 'debug':
		case 'eval':
		var ext = fileExtension.call(req);
		var r = {
			'req': req.url,
			'ext': '' + ext,
			'mime': '' + mimeType(ext)
		};
		res.setHeader('Content-Type', mimetypes.json);
		res.end(JSON.stringify(r));
		break;
		case 'datas':
		router(path_fragments,req,res);
		break;
		case 'bower_components':
		fs.readFile('.' + request.pathname , function (err, buf) {
			if (err) return done(err);
			res.setHeader('Content-Type', mimeType(fileExtension.call(req)));
			res.end(buf);
		});
		break;
		default:
		fs.readFile('./app' + request.pathname , function (err, buf) {
			if (err) return done(err);
			res.setHeader('Content-Type', mimeType(fileExtension.call(req)));
			res.end(buf);
		});
	}
});

server.listen(7777);
