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
				var prev=row, next=row, h=i, j=i;
				while ( prev && row.ts === prev.ts ) {
					h--;
					if (h in a) {
						prev = a[h];
					} else {
						prev = null;
					}
				}
				while ( next && row.ts === next.ts ) {
					j++;
					if (j in a) {
						next = a[j];
					} else {
						next = null;
					}
				}
				if (prev && next) {
					row.n = (1 / (next.ts - prev.ts)) * 1000;
				} else {
					row.n = null;
				}
				row.d = new Date( row.ts );
				return row;
			});

			//	chop off the first and last record, because they cannot reference their neighbours
			//	also prune illegal or paradoxical values
			fakeData = fakeData.filter(function(row){
				var isSane = true;
				if (!row.n) isSane = false;
				if ( row.n === Number.POSITIVE_INFINITY ) isSane = false;
				if ( isNaN(row.n) ) isSane = false;
				if (typeof row.n !== 'number') isSane = false;
				return isSane;
			});

			data_graphic({
				title: k,
				description: 'file operations per hour',
				data: fakeData,
				width: $(window).width() -100,
				height: $(window).height() - 200,
				target: '#' + id + ' .graph',
				x_accessor: 'd',
				y_accessor: 'n',
				min_x: new Date( periods[k]._range.raw.start ),
				max_x: new Date( periods[k]._range.raw.end ),
				point_size: 3,
				x_rug: true,
				y_rug: false,
				interpolate: 'linear'
			});

		}
	});
});
