function showDeletePopup_() {

  var calendars = [];
  
  CalendarApp.getAllCalendars().forEach(function(calendar) {
    calendars.push(calendar.getName());  
  })

  var template = HtmlService.createTemplateFromFile('Update Promotion Material/Delete.html');

  template.content = {
    'calendars': calendars
  };
  
  var html = template.evaluate().setWidth(520).setHeight(240);  
  DocumentApp.getUi().showModalDialog(html, 'Delete settings');
  
} // showDeletePopup_()

function deleteEvents_(calendarNames) {

  var logSheet = logInit()
  log(logSheet, JSON.stringify(calendarNames))

  var doc = getDoc_();
  var title = doc.getName();
  
  // Look for "[yyyy.MM.dd]", e.g. 2019.01.19, in the document's title
  var titleDate = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);
  
  if (titleDate.length !== 4) {
    throw new Error('No date in doc title: [yyyy.MM.dd]')
  }
  
  var year = parseInt(titleDate[1], 10);
  var month = parseInt(titleDate[2], 10) - 1;
  var day = parseInt(titleDate[3], 10);
  
  var start = new Date(year, month, day);
  var end = new Date((year + 1), month, day);
  
  calendarNames.forEach(function(calendarName) {
  
    var calendars = CalendarApp.getCalendarsByName(calendarName);
    
    if (calendars.length > 1) {
      throw new Error('More that one calendar called "' + calendarName + '"');
    }

    // Running through the loop once doesn't delete all the events,
    // so keep on running until they are all definitely gone

    var events = calendars[0].getEvents(start, end);
    var loopCount = 0

    while (events.length > 0) {
    
      deleteEvents(events);  
      Utilities.sleep(1000);
      var events = calendars[0].getEvents(start, end);  
      log(logSheet, 'loop count: ' + loopCount++);
              
    } // while still events 
    
  }) // for each calendar
  
  return 
  
  // Private Functions
  // -----------------
  
  function deleteEvents(events) {
    
    events.forEach(function(event){
    
      var name = event.getTitle();

      if (event.isRecurringEvent()) {
        event.getEventSeries().deleteEventSeries();
        log(logSheet, 'Deleted event series"' + name + '"')        
      } else {
        event.deleteEvent();
        log(logSheet, 'Deleted event"' + name + '"')
      }    
    })
    
  } // deleteEvents_.deleteEvents()
   
} // deleteEvents_()