function test_misc() {
  return
}

function test_download() {
  var file = DriveApp.getFileById('1MgQ55qb1_IeEsl04rjFvQr3tDy9CD0WE')
  var response = UrlFetchApp.fetch(file.getDownloadUrl(),{headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}});
  var a = response.getContentText();
  return;  
}

function test_toTitleCase() {
  var a = 'a short title example of a giraffe'
  var b = toTitleCase_(a)
  return
}

function test_toSentenceCase() {
  var a = 'a short title example of a giraffe'
  var b = toSentenceCase_(a)
  return
}

function test_ExportEvents() {
  var settings = {
    populate_days:           ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], 
    new_events_calendar:     "andrew@cloudfire.media", 
    regular_events_calendar: "andrew@cloudfire.media"
  }

  ExportEvents_(settings)
}

function test_formatDoc() {
  formatDoc_()
  return
}

function test_DeleteEvents() {
  DeleteEvents_(["andrew@cloudfire.media"])
}

function test_deleteAllEvents() {
  var startTime = new Date(2019, 8, 1)
  var endTime = new Date(2019, 9, 1)
  var calendar = CalendarApp.getCalendarsByName('andrew@cloudfire.media')[0]
  var eventId = calendar.getEventsForDay(endTime)[0].getId()
  calendar.getEventSeriesById(eventId).deleteEventSeries()
  
//  .getEvents(startTime, endTime, options).getEvents(startTime, endTime).forEach(function(event) {
//    event.deleteEvent()
//  })
}

function test_getSeason() {
  for (var i = 0; i < 12; i++) {
    Logger.log(getSeason(i))
  }
}
