"use strict";

d3.text('/data.json',function( rawdata ){
	var discrete_data = JSON.parse(rawdata);

	var first_op= new Date(d3.min(discrete_data.map(function(row){ return row.ts; })));
	var last_op	= new Date(d3.max(discrete_data.map(function(row){ return row.ts; })));

	//	start at 1am the first day of the first op
	var start = new Date();
	start.setFullYear( first_op.getFullYear(), first_op.getMonth(), first_op.getDate() );
	start.setHours(1);
	start.setMinutes(0);
	start.setSeconds(0);

	//	end at 11pm on the day of the last op
	var end = new Date();
	end.setFullYear( last_op.getFullYear(), last_op.getMonth(), last_op.getDate() );
	end.setHours(23);
	end.setMinutes(0);
	end.setSeconds(0);

	//	perform aggregation
	var thishour = start;
	var hours = [];
	var ONE_HOUR = 60*60*1000;
	var countOps = function(start_hour){
		var slice = discrete_data.filter(function(row){
			var is_in_range = false;
			if (row.ts >= start_hour && row.ts < (start_hour + ONE_HOUR) ) {
				is_in_range = true;
			}
			return is_in_range;
		});
		return slice.length;
	};
	var hr;
	var ops;
	while (thishour < end) {
		hr = thishour.getTime();
		ops = countOps(hr);
		hours.push({
			hr: hr,
			ops: ops
		});
		thishour.setHours( thishour.getHours() + 1 );
	}

	//	render
	data_graphic({
	    title: 'ok, kewl',
	    description: 'Sean Working',
	    data: hours,
	    width: 600,
	    height: 250,
	    target: '#fs',
	    x_accessor: 'hr',
	    y_accessor: 'ops'
	});	
});
