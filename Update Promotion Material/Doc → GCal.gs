// created by Mikhail K. on freelancer.com

// redevelopment note: write UI for assigning target calendar names, blackout dates, option to ignore all events on Sunday/Monday/etc.
// redevelopment note: currently, the script assumes that the start date in the filename is a Sunday. It should not assume this. If the start date in the script is not a Sunday, the script should take the first upcoming Sunday as the start date for populating events on Calendar.
// redevelopment note: be able to handle content like
//'>> Every 3rd Tuesday of the month' etc.
//'>> June 6 - 27' (currently this requires 'June 6 - June 27'
//'>> May 4-25, August 10-31

function to24Hours(hours, period) {
	if (period == 'AM' && hours == 12) {
		hours = 0;
	} else if (period == 'PM' && hours < 12) {
		hours = hours + 12;
	}

	return hours;
}

function ShowSettingsPopup() {
	var ui = DocumentApp.getUi(),
		tmpl = HtmlService.createTemplateFromFile('Settings.html'),
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

	ui.showModalDialog(html, 'Settings');
}

function ExportEvents(settings) {
	var regularEventsCalendar = CalendarApp.getCalendarsByName(settings.regular_events_calendar),
		newEventsCalendar = CalendarApp.getCalendarsByName(settings.new_events_calendar),
		events = ParseEvents(settings.populate_days),
		exclusion_days = GetExclusionDays(settings.exclude_dates_ss_url);

	AddEventsToCalendar(regularEventsCalendar, newEventsCalendar, exclusion_days, events);
}

function GetExclusionDays(url) {
	var ss = SpreadsheetApp.openByUrl(url),
		sheet = ss.getSheetByName('Holidays + Blackout Dates'),
		ranges = sheet.getRangeList(['A4:', 'D4:']).getRanges(),
		titles = ranges[0].getValues(),
		values = ranges[1].getValues();

	for (var i = 0; i < values.length; i++) {
		var val = String(values[i][0]).toLowerCase().trim();

		switch (val) {
			case 'yes': {
				//

				break;
			}
			case 'no': {
				//

				break;
			}
		}
	}

	return [];
}

function ParseEvents(populate_days) {
	var ui = DocumentApp.getUi(),
		doc = DocumentApp.getActiveDocument(),
		body = doc.getBody(),
		paragraphs = body.getParagraphs(),
		docName = doc.getName(),
		docDates = docName.match(/^\[\s([0-9]{4})\.([0-9]{2})\.([0-9]{2})\s\]/),
		docYear = Number(docDates[1]),
		docMonth = Number(docDates[2]) - 1,
		docDay = Number(docDates[3]),
		docDate = new Date(docYear, docMonth, docDay),
		months = [
			'JANUARY',
			'FEBRUARY',
			'MARCH',
			'APRIL',
			'MAY',
			'JUNE',
			'JULY',
			'AUGUST',
			'SEPTEMBER',
			'OCTOBER',
			'NOVEMBER',
			'DECEMBER'
		],
		data = [],
		isOtherEvents = false,
		day, timeFrame,
		location, title;

	for (var i=0; i < paragraphs.length; i++) {
		var paragraph = paragraphs[i],
			text = paragraph.getText().trim(),
			heading = paragraph.getHeading();

		if (text.toUpperCase() == 'OTHER EVENTS') {
			isOtherEvents = true;
		}

		if (!isOtherEvents) {
			if (populate_days.indexOf(day) > -1) {
				switch (heading) {
					// day of the week
					case DocumentApp.ParagraphHeading.HEADING1: {
						if (day != null) {
							docDate.setDate(docDate.getDate() + 1);
						}

						day = text.toLowerCase().trim();

						break;
					}
					// time
					case DocumentApp.ParagraphHeading.HEADING2: {
						var time = text.toUpperCase().trim(),
							founds = time.match(/^([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})\s*[–\-]\s*([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})$/);

						if (founds != null) {
							if (founds.length == 7) {
								timeFrame = {
									'start': {
										'hours': to24Hours(Number(founds[1]), founds[3]),
										'minutes': Number(founds[2])
									},
									'end': {
										'hours': to24Hours(Number(founds[4]), founds[6]),
										'minutes': Number(founds[5])
									},
								};
							}
						}

						break;
					}
					// title & location
					case DocumentApp.ParagraphHeading.HEADING3: {
						var header = text.split('|');

						if (header.length > 1) {
							switch (header.length) {
								case 2: {
									title = header[0].trim();
									location = header[1].trim();

									break;
								}
								case 3: {
									title = header[0].trim();
									location = header[2].trim();

									break;
								}
							}
						}

						break;
					}
					// description
					case DocumentApp.ParagraphHeading.HEADING4:
					case DocumentApp.ParagraphHeading.HEADING5: {
						var description = text.trim(),
							pDate = paragraphs[i + 1],
							curYear = docDate.getFullYear(),
							curMonth = docDate.getMonth(),
							curDay = docDate.getDate(),
							dates = {
								'start': new Date(curYear, curMonth, curDay, timeFrame.start.hours, timeFrame.start.minutes),
								'end': new Date(curYear, curMonth, curDay, timeFrame.end.hours, timeFrame.end.minutes)
							};

						if (pDate.getHeading() == DocumentApp.ParagraphHeading.HEADING6) {
							var note = pDate.getText().toUpperCase().trim(),
								founds;

							if (note.indexOf('>>') == 0) {
								note = note.substring(3);

								var founds = note.match(/^STARTS\s*(\w+)\s*([0-9]{1,2})/);

								if (founds != null) {
									if (founds.length == 3) {
										var month = months.indexOf(founds[1].toUpperCase()),
											day = Number(founds[2]);

										dates = {
											'start': new Date(curYear, month, day, timeFrame.start.hours, timeFrame.start.minutes),
											'end': new Date(curYear, month, day, timeFrame.end.hours, timeFrame.end.minutes)
										};
									}
								}

								founds = note.match(/^(\w+)\s*([0-9]{1,2})\s*[–\-]\s*(\w+)\s*([0-9]{1,2})[.;]{0,1}/);

								if (founds != null) {
									if (founds.length == 5) {
										var startMonth = months.indexOf(founds[1].toUpperCase()),
											startDay = Number(founds[2]),
											endMonth = months.indexOf(founds[3].toUpperCase()),
											endDay = Number(founds[4]);

										dates = {
											'start': new Date(curYear, startMonth, startDay, timeFrame.start.hours, timeFrame.start.minutes),
											'end': new Date(curYear, startMonth, startDay, timeFrame.end.hours, timeFrame.end.minutes),
											'finish': new Date(curYear, endMonth, endDay)
										};
									}
								}
							}
						}

						data.push({
							'title': title,
							'description': '<b>What\'s it all about?</b> '+ description + ' <br><br><b>Contact:</b> Greg Brewer at <a href="mailto:greg.brewer@ccnash.org">greg.brewer@ccnash.org</a>',
							'location': location,
							'dates': dates,
							'recurrence': 'WEEKLY'
						});

						break;
					}
				}
			}
		} else {
			var dates = null;

			switch (heading) {
				// title & location
				case DocumentApp.ParagraphHeading.HEADING3: {
					var header = text.split('|');

					if (header.length > 1) {
						switch (header.length) {
							case 2: {
								title = header[0].trim();
								location = header[1].trim();

								break;
							}
							case 3: {
								title = header[0].trim();
								location = header[2].trim();

								break;
							}
						}
					}

					break;
				}
				// description
				case DocumentApp.ParagraphHeading.HEADING4:
				case DocumentApp.ParagraphHeading.HEADING5: {
					var description = text.trim(),
						pDate = paragraphs[i + 1],
						curYear = docDate.getFullYear();

					if (pDate.getHeading() == DocumentApp.ParagraphHeading.HEADING6) {
						var note = pDate.getText().toUpperCase().trim(),
							founds;

						if (note.indexOf('>>') == 0) {
							note = note.substring(3);

							var founds = note.match(/^STARTS\s*(\w+)\s*([0-9]{1,2})/);

							if (founds != null) {
								if (founds.length == 3) {
									var month = months.indexOf(founds[1].toUpperCase()),
										day = Number(founds[2]);

									dates = {
										'start': new Date(curYear, month, day, 0, 0),
										'end': new Date(curYear, month, day, 24, 0)
									};
								}
							}

							founds = note.match(/^\w+\,\s*(\w+)\s*([0-9]{1,31})\s*AT\s*(?:([0-9]{1,2})|([0-9]{1,2})\:([0-9]{1,2}))([AM|PM]{2})$/);

							if (founds != null) {
								if (founds.length == 7) {
									var month = months.indexOf(founds[1].toUpperCase()),
										day = Number(founds[2]),
										hours,
										minutes = 0;

									if (founds[3] != null) {
										hours = to24Hours(Number(founds[3]), founds[6]);
									} else if (founds[4] != null && founds[5] != null) {
										hours = to24Hours(Number(founds[4]), founds[6]);
										minutes = founds[5];
									}

									dates = {
										'start': new Date(curYear, month, day, hours, minutes),
										'end': new Date(curYear, month, day, (hours + 1), minutes)
									};
								}
							}
						}

						if (dates != null) {
							day = date.start.getDay().toLowerCase();

							if (populate_days.indexOf(day) > -1) {
								data.push({
									'title': title,
									'description': '<b>What\'s it all about?</b> '+ description + ' <br><br><b>Contact:</b> Greg Brewer at <a href="mailto:greg.brewer@ccnash.org">greg.brewer@ccnash.org</a>',
									'location': location,
									'dates': dates,
									'recurrence': 'ONCE'
								});
							}
						}
					}

					break;
				}
			}
		}
	}

	return data;
}

function AddEventsToCalendar(regularEventsCalendar, newEventsCalendar, exclusion_days, data) {
	for (var index in data) {
		var event = data[index],
			calendar = event.title.toUpperCase().indexOf('NEW!') < 0 ? regularEventsCalendar : newEventsCalendar,
			options = {
				location: event.location,
				description: event.description
			};

		switch (event.recurrence) {
			case 'WEEKLY': {
				var recurrence = CalendarApp.newRecurrence().addWeeklyRule();

				if (exclusion_days.length > 0) {
					recurrence = recurrence.addYearlyExclusion().onlyOnYearDay(exclusion_days);
				}

				if (event.dates['finish'] != null) {
					recurrence.until(event.dates.finish);
				}

				calendar.createEventSeries(
					event.title,
					event.dates.start,
					event.dates.end,
					recurrence,
					options
				);

				break;
			}
			case 'ONCE': {
				calendar.createEvent(
					event.title,
					event.dates.start,
					event.dates.end,
					options
				);

				break;
			}
		}
	}
}