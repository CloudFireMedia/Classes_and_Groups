// created by Mikhail K. on freelancer.com

/*
function onOpen(e) {
	var ui = SpreadsheetApp.getUi();

	ui.createMenu('CloudFire')
		.addItem('Create schedule document', 'CreateScheduleDoc') 
		.addItem('Add to calendar', 'ShowExportPopup')
		.addItem('Delete from calendar', 'ShowDeletePopup')
		.addToUi();
}
*/
function Test_1() {
	ExportEvents({
		'regular_events_calendar': 'TEST',
		'new_events_calendar': 'TEST (NEW)',
		'exclude_dates_ss_url': 'https://docs.google.com/spreadsheets/d/1d0-hBf96ilIpAO67LR86leEq09jYP2866uWC48bJloc/edit',
		'populate_days': [
			'sunday',
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday'
		]
	});
}

function Test_2() {
	var exclusion_dates = GetExclusionDates('https://docs.google.com/spreadsheets/d/1d0-hBf96ilIpAO67LR86leEq09jYP2866uWC48bJloc/edit'),
		regularEventsCalendars = CalendarApp.getCalendarsByName('TEST'),
		newEventsCalendars = CalendarApp.getCalendarsByName('TEST (NEW)');

	ExcludeEvents([regularEventsCalendars[0], newEventsCalendars[0]], exclusion_dates);
}

function Test_3() {
	DeleteEvents(['TEST', 'TEST (NEW)']);
}

function to12Hours(hours) {
	if (hours > 12) {
		return (hours - 12);
	} else if (hours == 0) {
		return 12;
	}

	return hours;
}

function get12period(hours) {
	if (hours < 12) {
		return 'am';
	} else {
		return 'pm';
	}
}

function to2digits(i) {
	if (i < 10) {
		i = '0' + i;
	}

	return i;
}

function isInArray(arr, obj) {
	for (var i = 0; i < arr.length; i++) {
		if (+arr[i] === +obj) {
			return true;
		}
	}

	return false;
}

function getDateByName(sheetName) {
	var sheetDates = sheetName.match(/^\[\s([0-9]{4})\.([0-9]{2})\.([0-9]{2})\s\]/),
		sheetYear = Number(sheetDates[1]),
		sheetMonth = Number(sheetDates[2]) - 1,
		sheetDay = Number(sheetDates[3]);

	return new Date(sheetYear, sheetMonth, sheetDay);
}

function CreateScheduleDoc() {
	var ss = SpreadsheetApp.getActive(),
		sheet = ss.getActiveSheet(),
		sheetName = sheet.getName()
		sheetDate = getDateByName(sheetName),
		doc = DocumentApp.create(sheetName),
		body = doc.getBody(),
		data = ParseEvents(),
		months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		],
		days = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday'
		];

	for (var key in data) {
		var section = data[key];

		if (section.events.length > 0) { 
			var sectionTitle = body.appendParagraph(section.title),
				startTime;

			sectionTitle.setHeading(DocumentApp.ParagraphHeading.HEADING1);

			for (var i = 0; i < section.events.length; i++) {
				var event = section.events[i],
					isNewTitle = event.IsNew ? 'NEW! ' : '',
					startHour = event.Start.getHours(),
					startMin = to2digits(event.Start.getMinutes()),
					endHour = event.End.getHours(),
					endMin = to2digits(event.End.getMinutes());

				if (event.Recurrence.Repeat != 'ONCE') {
					if (startTime == null) {
						startTime = event.Start;

						var eventsTime = body.appendParagraph(to12Hours(startHour) + ':' + startMin + get12period(startHour) + ' – ' + to12Hours(endHour) + ':' + endMin + get12period(endHour));

						eventsTime.setHeading(DocumentApp.ParagraphHeading.HEADING2);
					} else if (startTime.getTime() < event.Start.getTime()) {
						startTime = event.Start;

						var eventsTime = body.appendParagraph(to12Hours(startHour) + ':' + startMin + get12period(startHour) + ' – ' + to12Hours(endHour) + ':' + endMin + get12period(endHour));

						eventsTime.setHeading(DocumentApp.ParagraphHeading.HEADING2);
					}
				}

				var eventTitle = body.appendParagraph(isNewTitle + event.Title + ' | ' + event.Location);

				eventTitle.setHeading(DocumentApp.ParagraphHeading.HEADING3);

				if (event.Description != '') {
					var eventDescription = body.appendParagraph(event.Description);

					eventDescription.setHeading(DocumentApp.ParagraphHeading.HEADING4);
				}

				var noticeTitle = '>> ';

				switch (event.Recurrence.Repeat) {
					case 'ONCE': {
						noticeTitle += days[event.Start.getDay()] + ', ' + months[event.Start.getMonth()] + ' ' + event.Start.getDate() + ' at ' + to12Hours(startHour) + ':' + startMin + get12period(startHour);

						break;
					}
					case 'WEEKLY': {
						if (event['Finish'] != null) {
							noticeTitle += months[event.Start.getMonth()] + ' ' + event.Start.getDate() + ' - ' + months[event.Finish.getMonth()] + ' ' + event.Finish.getDate();
						} else if ((event.Start.getTime() - ((event.Start.getHours() * 60 * 60 * 1000) + (event.Start.getMinutes() * 60 * 1000) + sheetDate.getTime())) / (24 * 60 * 60 * 1000) >= 7) {
							noticeTitle += 'Starts at ' + months[event.Start.getMonth()] + ' ' + event.Start.getDate();
						}

						break;
					}
					case 'MONTHLY': {
						if (event.Recurrence.Conditions.Type == 'WEEKDAY') {
							noticeTitle += event.Recurrence.Conditions.Queue + 'nd ' + days[event.Start.getDay()] + ' of each month';
						} else {
							//
						}

						break;
					}
				}

				if ((noticeTitle != '>> ')||(event.Notice != '')) {
					var eventNotice = body.appendParagraph(noticeTitle + (((noticeTitle != '>> ')&&(event.Notice != '')) ? '; ' : '') + event.Notice);

					eventNotice.setHeading(DocumentApp.ParagraphHeading.HEADING6);
				}
			}
		}
	}
}

function ParseEvents() {
	var ss = SpreadsheetApp.getActive(),
		sheet = ss.getActiveSheet(),
		range = sheet.getDataRange(),
		values = range.getValues(),
		results = [
			{
				'title': 'SUNDAY',
				'events': []
			},
			{
				'title': 'MONDAY',
				'events': []
			},
			{
				'title': 'TUESDAY',
				'events': []
			},
			{
				'title': 'WEDNESDAY',
				'events': []
			},
			{
				'title': 'THURSDAY',
				'events': []
			},
			{
				'title': 'FRIDAY',
				'events': []
			},
			{
				'title': 'SATURDAY',
				'events': []
			},
			{
				'title': 'OTHER EVENTS',
				'events': []
			}
		];

	for (var i = 1; i < values.length; i++) {
		var startDate = new Date(values[i][7]),
			startTime = new Date(values[i][8]),
			endDate = new Date(values[i][7]),
			endTime = new Date(values[i][9]);

		startDate.setHours(startTime.getHours(), startTime.getMinutes());
		endDate.setHours(endTime.getHours(), endTime.getMinutes());

		var eventObj = {
				'Timestamp': Number(values[i][0]),
				'Email': String(values[i][1]).trim(),
				'Location': String(values[i][2]).trim(),
				'IsNew': (String(values[i][3]).trim().toUpperCase() == 'YES') ? true : false,
				'Title': String(values[i][4]).trim(),
				'Description': String(values[i][5]).trim(),
				'Notice': String(values[i][6]).trim(),
				'Start': startDate,
				'End': endDate,
				'Recurrence': {
					'Repeat': String(values[i][10]).trim().toUpperCase()
				}
			},
			sectionId = (eventObj.Recurrence.Repeat == 'ONCE') ? 7 : startDate.getDay();

		switch (eventObj.Recurrence.Repeat) {
			case 'WEEKLY': {
				if (String(values[i][11]) != '') {
					eventObj['Finish'] = new Date(values[i][11]);
				}

				break;
			}
			case 'MONTHLY': {
				if (String(values[i][13]) != '') {
					eventObj['Finish'] = new Date(values[i][13]);
				}

				switch (String(values[i][12]).trim().toLowerCase()) {
					case 'each selected day number of the month': {
						eventObj.Recurrence['Conditions'] = {
							'Type': 'DATE'
						};

						break;
					}
					case 'each selected week and day of the week': {
						var firstDay = new Date(eventObj.Start.getFullYear(), eventObj.Start.getMonth(), 1).getDay();

						eventObj.Recurrence['Conditions'] = {
							'Type': 'WEEKDAY',
							'Queue': Math.ceil((eventObj.Start.getDate() + firstDay) / 7),
							'Day': eventObj.Start.getDay()
						};

						break;
					}
				}

				break;
			}
		}

		results[sectionId].events.push(eventObj);
	}

	return results;
}

function GetExclusionDates(url) {
	var ss = SpreadsheetApp.openByUrl(url),
		sheet = ss.getSheetByName('Calendars Blackout Dates'),
		ranges = sheet.getRangeList(['A5:A', 'D5:D', 'H5:S']).getRanges(),
		titles = ranges[0].getValues(),
		values = ranges[1].getValues(),
		periods = ranges[2].getValues(),
		dates = [];

	for (var i = 0; i < titles.length; i++) {
		var title = String(titles[i][0]).trim(),
			value = String(values[i][0]).toLowerCase().trim();

		if (value == 'yes') {
			var start, end;

			for (var col = 0; col < periods[i].length; col++) {
				if (!isNaN(periods[i][col])) {
					if ((col + 1) % 2 != 0) {
						start = new Date(periods[i][col]);
					} else {
						end = new Date(periods[i][col]);

						if (start < end) {
							var startTS = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()),
								endTS = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()),
								days = Math.floor((endTS - startTS) / (1000*60*60*24));

							for (var j = 0; j <= days; j++) {
								var date = new Date(start);

								date.setDate(date.getDate() + j);

								if (!isInArray(dates, date)) {
									dates.push(date);
								}
							}
						} else {
							if (!isInArray(dates, start)) {
								dates.push(start);
							}
						}
					}
				}
			}
		}
	}

	return dates;
}

function ShowExportPopup() {
	var ui = SpreadsheetApp.getUi(),
		tmpl = HtmlService.createTemplateFromFile('Export.html'),
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
				   .setHeight(640);

	ui.showModalDialog(html, 'Export settings');
}

function ExportEvents(settings) {
	var regularEventsCalendars = CalendarApp.getCalendarsByName(settings.regular_events_calendar),
		newEventsCalendars = CalendarApp.getCalendarsByName(settings.new_events_calendar),
		exclusion_dates = GetExclusionDates(settings.exclude_dates_ss_url),
		data = ParseEvents(),
		events = [];

	for (var i = 0; i < data.length; i++) {
		var section = data[i];

		if (settings.populate_days.indexOf(section.title.toLowerCase()) > -1) {
			for (var j = 0; j < section.events.length; j++) {
				events.push(section.events[j]);
			}
		}
	}

	AddEventsToCalendar(regularEventsCalendars[0], newEventsCalendars[0], exclusion_dates, events);
	ExcludeEvents([regularEventsCalendars[0], newEventsCalendars[0]], exclusion_dates);
}

function AddEventsToCalendar(regularEventsCalendar, newEventsCalendar, exclusion_dates, data) {
	var days = [
			'SUNDAY',
			'MONDAY',
			'TUESDAY',
			'WEDNESDAY',
			'THURSDAY',
			'FRIDAY',
			'SATURDAY'
		];

	for (var i = 0; i < data.length; i++) {
		var event = data[i],
			calendar = !event.IsNew ? regularEventsCalendar : newEventsCalendar,
			options = {
				location: event.Location,
				description: event.Description
			};

		switch (event.Recurrence.Repeat) {
			case 'MONTHLY': {
				var recurrence = CalendarApp.newRecurrence().addWeeklyRule();

				/*for (var j = 0; j < exclusion_dates.length; j++) {
					recurrence.addDateExclusion(exclusion_dates[j]);
				}*/

				if (event['Finish'] != null) {
					recurrence.until(event.Finish);
				}

				switch (event.Recurrence.Conditions.Type) {
					case 'DATE': {
						break;
					}
					case 'WEEKDAY': {
						var startDay = (7 * (event.Recurrence.Conditions.Queue - 1)),
							weekday = days[event.Recurrence.Conditions.Day],
							excludeDays = [];

						for (var j = 1; j <= 31; j++) {
							excludeDays.push(j);
						}

						excludeDays.splice(excludeDays.indexOf(startDay + 1), 7);

						recurrence.addMonthlyExclusion()
								  .onlyOnMonthDays(excludeDays)
								  .onlyOnWeekday(CalendarApp.Weekday[weekday]);

						break;
					}
				}

				calendar.createEventSeries(
					event.Title,
					event.Start,
					event.End,
					recurrence,
					options
				);

				break;
			}
			case 'WEEKLY': {
				var recurrence = CalendarApp.newRecurrence().addWeeklyRule();

				/*for (var j = 0; j < exclusion_dates.length; j++) {
					recurrence.addDateExclusion(exclusion_dates[j]);
				}*/

				if (event['Finish'] != null) {
					recurrence.until(event.Finish);
				}

				calendar.createEventSeries(
					event.Title,
					event.Start,
					event.End,
					recurrence,
					options
				);

				break;
			}
			case 'ONCE': {
				calendar.createEvent(
					event.Title,
					event.Start,
					event.End,
					options
				);

				break;
			}
		}
	}
}

function ExcludeEvents(calendars, exclusion_dates) {
	for (var index in exclusion_dates) {
		var date = exclusion_dates[index];

		for (var i = 0; i < calendars.length; i++) {
			var events = calendars[i].getEventsForDay(date);

			for (var j = 0; j < events.length; j++) {
				events[j].deleteEvent();
			}
		}
	}
}