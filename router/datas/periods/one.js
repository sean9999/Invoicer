"use strict";

module.exports = function(frags,req,res) {

	switch (frags[0]) {

		case undefined:
		case 'index':
		case null:
		withAllRecords(function(allrecords){

			var r = {};
			/**
			 * Sets values for the next thisWeekStart and thisWeekEnd based on a start value
			 * Note that we are (potentially) setting parent vars directly, and only returning true or false
			 * @param  {Date}   start  the old thisWeekStart value
			 * @return {Boolean}       True if the new values fall within valid ranges, else false.
			 *
			 */
			var next = function(start){
				var nextStart, nextEnd, isValid;
				if (typeof start === 'undefined') {
					nextStart = startDate;
					if (nextStart.getUTCDate(1)) {
						nextEnd = new Date(nextStart);
						nextEnd.setUTCDate(14);
					} else {
						nextEnd = new Date( nextStart.getUTCFullYear(), nextStart.getUTCMonth()+1, 0 );
					}
				} else if ( start.getUTCDate() === 1 ) {
					nextStart = new Date( start.getUTCFullYear(), start.getUTCMonth(), 15 );
					nextEnd = new Date( start.getUTCFullYear(), start.getUTCMonth()+1, 0 );
				} else {
					nextStart = new Date( start.getUTCFullYear(), start.getUTCMonth()+1, 1 );
					nextEnd = new Date( nextStart );
					nextEnd.setUTCDate(14);
				}
				nextStart.setUTCHours(0,0,0,0);
				nextEnd.setUTCHours(23,59,59,999);
				//	check that they fall within valid range
				isValid = (nextEnd <= endDate);
				//	if so, rewrite parent vars
				if (isValid) {
					thisWeekStart = nextStart;
					thisWeekEnd = nextEnd;
				}
				return isValid;
			};
			//	get upper and lower bounds, and nice them
			var lowest_value	= allrecords[0];
			var highest_value	= allrecords[ allrecords.length-1 ];
			var startDate		= new Date(lowest_value.ts);
			var endDate			= new Date(highest_value.ts);
			//	 start on the first day of the month, or the 15th.
			startDate.setUTCDate( 1 );
			startDate.setUTCHours(0,0,0,0);
			//	likewise, end nicely
			if ( endDate.getUTCDate() < 15 ) {
				endDate = new Date( endDate.getUTCFullYear(), endDate.getUTCMonth(), 14 );
			} else {
				endDate = new Date( endDate.getUTCFullYear(), endDate.getUTCMonth()+1, 0 );
			}
			endDate.setUTCHours(23,59,59,999);
			r['_meta'] = {
				start: startDate.toUTCString(),
				end: endDate.toUTCString()
			};

			//	iterate
			var thisWeekStart, thisWeekEnd, weekString, fileOps;
			while ( next(thisWeekStart) ) {
				var weekString = thisWeekStart.toDateString();
				fileOps = allrecords.filter(function(row){
					var isInRange = false;
					if ( row.ts >= thisWeekStart.valueOf() && row.ts < thisWeekEnd.valueOf() ) {
						isInRange = true;
					}
					return isInRange;
				});
				fileOps.sort(function(a,b){
					if (a.ts < b.ts) return -1;
					if (a.ts > b.ts) return 1;
					return 0;
				});
				r[weekString] = {
					"_range": {
						raw: {
							start: thisWeekStart.valueOf(),
							end: thisWeekEnd.valueOf()
						},
						pretty: {
							start: thisWeekStart.toUTCString(),
							end: thisWeekEnd.toUTCString()
						}
					},
					fileOps: fileOps,
					commits: [],
					uuid: uuid.v4()
				};
			}

			repo.exec('log', '--author=' + AUTHOR_REGEX, function(err,rawresult){
				var allcommits = formatCommits(rawresult),
					upperBound,
					lowerBound,
					relevantCommits=[],
					k;
				for (k in r) {
					if (k === '_meta') continue;
					upperBound = r[k]._range.raw.end;
					lowerBound = r[k]._range.raw.start;
					relevantCommits = allcommits.filter(function(commit){
						var isInRange = false;
						if (commit.ts >= lowerBound && commit.ts < upperBound ) {
							isInRange = true;
						}
						return isInRange;
					});
					r[k].commits = relevantCommits;
				}
				res.end( JSON.stringify(r) );
			});
		});
		break;

		default:
		res.end( JSON.stringify(frags) );
		break;

	}

};