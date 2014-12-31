"use strict";

function byVal(i) {
	return JSON.parse(JSON.stringify(i));
}

$(function(){
	d3.json('/datas/periods/semimonth',function( periods ){
		var k,
			id,
			p,
			vData,
			sData;
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

			//	add velocity to data by calculating the distance of a nodes neighbours on either side
			vData = periods[k].fileOps.map(function(row,i,a){
				var prev = byVal(row), next = byVal(row), h=i, j=i;
				while ( prev && row.ts === prev.ts ) {
					h = h - 1;
					if (h in a) {
						prev = byVal(a[h]);
					} else {
						prev = false;
					}
				}
				while ( next && row.ts === next.ts ) {
					j = j + 1;
					if (j in a) {
						next = byVal(a[j]);
					} else {
						next = false;
					}
				}
				//	operations per hour
				if ( prev && next ) {
					row.n = (1 / (next.ts - prev.ts)) * (1000*60*60) * 2;
				} else if (prev) {
					row.n = (1 / (row.ts - prev.ts)) * (1000*60*60);
				} else if (next) {
					row.n = (1 / (next.ts - row.ts)) * (1000*60*60);
				} else {
					row.n = null;
				}
				row.d = new Date( row.ts );
				return row;
			});
			//	in order to mark periods of inactivity, we add silence markers.
			//	let's say 15 minutes of inactivity denotes "not working"
			//	this is so "not working" periods have 0 velocity, and are excluded from averages
			sData = [];
			vData.forEach(function(row,i,a){
				var next, prev, justAfter, justBeforeNext, gracePeriod=(1000*60*15);
				sData.push(row);
				if (i !== 0 && i !== a.length-1) {
					next = a[i+1];
					if ( (next.ts - row.ts) > gracePeriod ) {
						//	add two silence markers. one 15 minutes after this op,
						//	and one just before the next
						justAfter = row.ts + gracePeriod;
						justBeforeNext = next.ts - 17;
						sData.push({
							action: "stopped working",
							filepath: null,
							invoicid: row.invoicid,
							line_id: row.line_id,
							machine: row.machine,
							n: 0,
							snapshot: null,
							watchkey: "injected",
							ts: justAfter,
							d: new Date(justAfter)
						});
						sData.push({
							action: "started working",
							filepath: null,
							invoicid: row.invoicid,
							line_id: row.line_id,
							machine: row.machine,
							n: 0,
							snapshot: null,
							watchkey: "injected",
							ts: justBeforeNext,
							d: new Date(justBeforeNext)
						});
					}
				}
			});
			//	prune illegal or paradoxical values
			sData = sData.filter(function(row){
				var isSane = true;
				if ( row.n === Number.POSITIVE_INFINITY ) isSane = false;
				if ( isNaN(row.n) ) isSane = false;
				if (typeof row.n !== 'number') isSane = false;
				if (!isSane) {
					console.log('not sane',row);
				}
				return isSane;
			});

			MG.data_graphic({
				title: k,
				description: 'file operations per hour',
				data: sData,
				width: $(window).width() * 25,
				height: $(window).height() - 100,
				target: '#' + id + ' .graph',
				x_accessor: 'd',
				y_accessor: 'n',
				min_x: new Date( periods[k]._range.raw.start ),
				max_x: new Date( periods[k]._range.raw.end ),
				point_size: 3,
				x_rug: true,
				y_rug: false
			});
		}
	});
});
