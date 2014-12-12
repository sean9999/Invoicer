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

			var fakeData = periods[k].fileOps.map(function(row,i,a){
				var prev=row, next=row, velocity;
				if (i > 0) {
					prev = a[i-1];
				}
				if (i < a.length-1) {
					next = a[i+1];
				}
				velocity = next.ts - prev.ts;
				row.n = velocity;
				row.d = new Date( row.ts );
				return row;
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
