function test_misc() {
  var time = ''
  var finds = time.match(/^([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})\s*[–\-]\s*([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})$/);    
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