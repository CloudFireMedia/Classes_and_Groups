// Redevelopment Note: right now, the script deletes events one-at-a-time.
// It should treat the first ocurenence of each event as one in a series and should delete
// 'This and following events' (NOT 'This event' and NOT 'All events').

// Ioan writes on Freelancer.com 'The script takes long because it depends on number of events in calendar.
// In order to optimize it, probably a way would be to use direct the calendar API.
// Without testing and without access to calendars I can't do that.

function DeleteEvents() {
	var doc = DocumentApp.getActiveDocument(),
		title = doc.getName(),
		year = 1970,
		month = 0,
		day = 1,
		res = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);

	if (res.length == 4) {
		year = parseInt(res[1], 10);
		month = parseInt(res[2], 10) - 1;
		day = parseInt(res[3], 10);
	}

	var calendars = CalendarApp.getAllCalendars(),
		start = new Date(year, month, day, 0, 0, 0),
		end = new Date(2070, 0, 31, 0, 0, 0);

	for (var index in calendars) {
		var calendar = calendars[index];

		switch (calendar.getName()) {
			case 'CCN Classes and Groups':
			case 'CCN NEW! Events': {
				var events = calendar.getEvents(start, end);

				for (var i = 0; i < events.length; i++) {
					var event = events[i];

					event.deleteEvent();
				}

				break;
			}
		}
	}
}