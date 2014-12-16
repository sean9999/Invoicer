;(function(undefined){
	"use strict";
	$(function(){
		$.getJSON('/datas/git/log',function(result){
			$('#x').text( JSON.stringify(result,null,"\t") );
			hljs.highlightBlock( document.getElementById('x') );
		});
		var freakOut = function(){
			var rand = (function(){
				var a = [Math.random()];
				while (a.length < 4) {
					a.unshift(Math.floor(Math.random()*255));
				}
				var b = [
					254 - a[0],
					254 - a[1],
					254 - a[2],
					1 - a[3]
				];
				return [
					a.join(','),
					b.join(',')
				];
			})();
			document.getElementsByTagName('h1')[0].style.color = 'rgba('+rand[1]+')';
			document.body.bgColor = 'rgba('+rand[0]+')';
			window.setTimeout(freakOut,Math.random()*1000);
		};
		window.setTimeout(freakOut,2000);
	});
})();
