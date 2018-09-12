function ShowDeletePopup() {
	var ui = SpreadsheetApp.getUi(),
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
				   .setHeight(240);

	ui.showModalDialog(html, 'Delete settings');
}

function DeleteEvents(calendars_names) {
	var ss = SpreadsheetApp.getActive(),
		sheet = ss.getActiveSheet(),
		sheetDate = getDateByName(sheet.getName());

	var start = new Date(sheetDate.getFullYear(), sheetDate.getMonth(), sheetDate.getDate(), 0, 0, 0),
		end = new Date((sheetDate.getFullYear() + 1), sheetDate.getMonth(), sheetDate.getDate(), 0, 0, 0);

	for (var i = 0; i < calendars_names.length; i++) {
		var calendar = CalendarApp.getCalendarsByName(calendars_names[i]),
			events = calendar[0].getEvents(start, end);

		while (events.length > 0) {
			var event = events[0];

			if (event.isRecurringEvent()) {
				event.getEventSeries().deleteEventSeries();
			} else {
				event.deleteEvent();
			}

			events = calendar[0].getEvents(start, end);
		}
	}
}