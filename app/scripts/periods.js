"use strict";

$(function(){
	d3.json('/datas/periods',function( periods ){
		var k,
			id,
			p;

		$('#title, title').text( periods._meta.start + ' - ' + periods._meta.end );
		delete periods._meta;

		for (k in periods) {
			id = 'u' + periods[k].uuid;
			p = $('#p').clone();
			p.find('h2').text(k);
			p.find('figcaption').text( periods[k]._range.pretty.start + ' - ' + periods[k]._range.pretty.end );
			p.prop('hidden',false);
			p.prop('id', id);
			p.appendTo('#torso');

			//	fake velocity stats
			var fakeData = periods[k].fileOps.map(function(row,i,a){
				var prev, next, h=i-1,j=i+1;
				if (h in a && j in a) {
					prev = a[h];
					next = a[j];
					row.n = (1 / (next.ts - prev.ts)) * 1000;
					console.log(row.n);
				} else {
					row.n = null;
				}
				row.d = new Date( row.ts );
				return row;
			});

			//	chop off the first and last record, because they cannot reference their neighbours
			fakeData = fakeData.filter(function(row){
				return ( row.n );
			});

			data_graphic({
				title: k,
				description: 'file operations per hour',
				data: fakeData,
				width: $(window).width() * 4,
				height: $(window).height() - 200,
				target: '#' + id + ' .graph',
				x_accessor: 'd',
				y_accessor: 'n',
				min_x: new Date( periods[k]._range.raw.start ),
				max_x: new Date( periods[k]._range.raw.end ),
				point_size: 3,
				x_rug: false,
				y_rug: true,
				interpolate: 'linear'
			});

		}
	});
});
