// Redevelopment Note: right now, the script deletes events one-at-a-time.
// It should treat the first ocurenence of each event as one in a series and should delete
// 'This and following events' (NOT 'This event' and NOT 'All events').

// Ioan writes on Freelancer.com 'The script takes long because it depends on number of events in calendar.
// In order to optimize it, probably a way would be to use direct the calendar API.
// Without testing and without access to calendars I can't do that.

function ShowDeletePopup() {
	var ui = DocumentApp.getUi(),
		tmpl = HtmlService.createTemplateFromFile('Update Promotion Material/Delete.html'),
		all_calendars = CalendarApp.getAllCalendars(),
		calendars = [];

	for (var index in all_calendars) {
		var calendar = all_calendars[index];

		calendars.push(calendar.getName());
	}

	tmpl.content = {
		'calendars': calendars
	};

	var html = tmpl.evaluate()
				   .setWidth(520)
				   .setHeight(140);

	ui.showModalDialog(html, 'Delete settings');
}

function DeleteEvents(calendar_name) {
	var doc = DocumentApp.getActiveDocument(),
		calendars = CalendarApp.getCalendarsByName(calendar_name),
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

	var start = new Date(year, month, day, 0, 0, 0),
		end = new Date((year + 1), month, day, 0, 0, 0);

	for (var i = 0; i < calendars.length; i++) {
		var calendar = calendars[i],
			events = calendar.getEvents(start, end);

		while (events.length > 0) {
			var event = events[0];

			if (event.isRecurringEvent()) {
				event.getEventSeries().deleteEventSeries();
			} else {
				event.deleteEvent();
			}

			events = calendar.getEvents(start, end);
		}
	}
}