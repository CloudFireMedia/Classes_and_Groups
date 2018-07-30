// Redevelopment Note: right now, the script deletes events one-at-a-time. It should treat the first ocurenence of each event as one in a series and should delete 'This and following events' (NOT 'This event' and NOT 'All events').
// Ioan writes on Freelancer.com 'The script takes long because it depends on number of events in calendar. In order to optimize it, probably a way would be to use direct the calendar API. Without testing and without access to calendars I can't do that.

function DeleteEvents() {

	var actDoc = DocumentApp.getActiveDocument();
	var title = actDoc.getName();

	var year = 1970;
	var month = 0;
	var day = 1;

	var regExp = /\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/;

	var res = title.match(regExp);

	if (res.length == 4) {

		year = parseInt(res[1], 10)
			month = parseInt(res[2], 10) - 1
			day = parseInt(res[3], 10)
	}

	//Logger.log(year)
	//Logger.log(month)
	//Logger.log(day)
	//return

	var app = CalendarApp,
	calendars = app.getAllCalendars(),
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