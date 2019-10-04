function test_misc() {
  var firstWord = "9:00am – 10:00am"
  var b = "9:00am"
    var patt = new RegExp(/([0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|([1-9]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|(1[0-2]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))/);
    var a = firstWord.match(patt);
  var res = patt.test(firstWord);
  var c = patt.test(b);
  var d = b.match(patt)
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