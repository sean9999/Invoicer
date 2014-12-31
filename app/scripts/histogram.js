"use strict";

$(function(){
	d3.json('/datas/fs/hits',function( rawdata ){
		var thedatas = rawdata,
			metadata;
		if (typeof thedatas[0] === 'object') {
			metadata = thedatas.shift();
		}
		MG.data_graphic({
			title: 'Hours Logged',
			description: 'on nuMops, as tracked by grunt-watch',
			data: thedatas,
			bins: metadata.goodBinNumber,
			chart_type: 'histogram',
			width: $(window).width() - 100,
			height: $(window).height() - 200,
			target: '#fs',
			y_extended_ticks: true,
			animate_on_load: true,
			x_label: "date as timestamp",
			y_label: "n fs ops"
		});	
	});
});
