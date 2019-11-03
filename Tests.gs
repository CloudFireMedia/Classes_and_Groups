
function test_misc() {
  var doc = DocumentApp.openById('12twNDzyMBA0iHmqm79Vr0KIU8O35wklvWWlJogKC3-g')
  var a = 'IMPORT ' + doc.getName().split('\\.')[0] + '.json';
  return
}

function test_doGet() {
  doGet({parameter: {id: '1V3tIQfbR-PcijnlhmwjNhvwIKJe6njrl'}});
}

function test_chooseSettingsFile() {
  chooseSettingsFile_();
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

function test_exportEvents() {
  var settings = {
    populate_days:           ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], 
    new_events_calendar:     "andrew@cloudfire.media", 
    regular_events_calendar: "andrew@cloudfire.media"
  }
  exportEvents_(settings)
}

function test_formatDoc() {
  formatDoc_()
  return
}

function test_DeleteEvents() {

  var startTime = new Date(2019,9,1)
  var endTime = new Date(2020,0,31)
  var events = CalendarApp.getCalendarsByName("andrew@cloudfire.media")[0].getEvents(startTime, endTime)
  var logSheet = logInit_()
  
  log_(logSheet, 'events: '+ events.length)

//  deleteEvents_(["andrew@cloudfire.media"])
  
//  function deleteEvents(events) {
    
    events.forEach(function(event) {
    
      var name = event.getTitle();

      if (event.isRecurringEvent()) {
        event.getEventSeries().deleteEventSeries();
        log_(logSheet, 'Deleted event series"' + name + '" (' + event.getStartTime() + ')');    
      } else {
        event.deleteEvent();
        log_(logSheet, 'Deleted event "' + name + '" (' + event.getStartTime() + ')');
      }    
    });
    
//  } // deleteEvents_.deleteEvents()
  
  
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
