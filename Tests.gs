/*

function test_init() {
  Log_ = BBLog.getLog({
    level:                BBLog.Level.FINE, 
    displayFunctionNames: BBLog.DisplayFunctionNames.NO,
    sheetId:              Config.get('CLASSES_AND_GROUPS_LOG_ID'),
  })
}

// DocumentApp.getActiveDocument().getBody().getParagraphs()[0].getHeading()

function test_misc() {
  test_init();
  var paragraphs = Utils.getDoc(TEST_DOC_ID_).getBody().getParagraphs();
  paragraphs.forEach(function(p) {
    Logger.log(p.getAttributes());
  })
//  setStyle_(paragraph, 'HEADING3');
}

function test_getDateOnThisDay() {
  var a = getDateOnThisDay_(new Date(2019, 10, 7), 'Sunday', true);
  return
}

function test_exportEvents() {
  test_init()
  var settings = {
//    populate_days:           ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], 
    populate_days:           ["sunday"], 
    new_events_calendar:     "andrew@cloudfire.media", 
    regular_events_calendar: "andrew@cloudfire.media"
  }
  exportEvents_(settings)
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

function test_formatDoc() {
  formatDoc_()
  return
}

function test_DeleteEvents() {

  var startTime = new Date(2019,9,1)
  var endTime = new Date(2020,0,31)
  var events = CalendarApp.getCalendarsByName("andrew@cloudfire.media")[0].getEvents(startTime, endTime)  
  Log_.info('events: '+ events.length)

//  deleteEvents_(["andrew@cloudfire.media"])
  
//  function deleteEvents(events) {
    
    events.forEach(function(event) {
    
      var name = event.getTitle();

      if (event.isRecurringEvent()) {
        event.getEventSeries().deleteEventSeries();
        Log_.info('Deleted event series"' + name + '" (' + event.getStartTime() + ')');    
      } else {
        event.deleteEvent();
        Log_.info('Deleted event "' + name + '" (' + event.getStartTime() + ')');
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

*/