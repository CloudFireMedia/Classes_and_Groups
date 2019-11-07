// jshint: 28Oct2019

function showDeletePopup_() {

  var calendars = [];
  
  CalendarApp.getAllCalendars().forEach(function(calendar) {
    calendars.push(calendar.getName());  
  });

  var template = HtmlService.createTemplateFromFile('Update Promotion Material/Delete.html');

  template.content = {
    'calendars': calendars
  };
  
  var html = template.evaluate().setWidth(520).setHeight(240);  
  DocumentApp.getUi().showModalDialog(html, 'Delete settings');
  
} // showDeletePopup_()

function deleteEvents_(calendarNames) {

  Log_.fine(JSON.stringify(calendarNames));

  var doc = Utils.getDoc(TEST_DOC_ID_);
  var title = doc.getName();
  
  var start = getDateTimeFromDocTitle_(title);
  
  if (start === null) {
    throw new Error('No date in doc title: [ yyyy.MM.dd ]');
  }

  var end = new Date(start.getYear() + 1, start.getMonth(), start.getDate());
  
  calendarNames.forEach(function(calendarName) {
  
    var calendars = CalendarApp.getCalendarsByName(calendarName);
    
    if (calendars.length > 1) {
      throw new Error('More that one calendar called "' + calendarName + '"');
    }

    // Although all of the events in a series are counted individually, once the 
    // series has been deleted all the subsequent events are also deleted.
    // So each time a event or event series is deleted we have to re-get the 
    // whole list

    var events = calendars[0].getEvents(start, end);
    var loopCount = 0;

    while (events.length > 0) {
    
      var event = events[0];
      var name = event.getTitle();
    
      if (event.isRecurringEvent()) {              
        event.getEventSeries().deleteEventSeries();
        Log_.info('Deleted event series"' + name + '" (' + event.getStartTime() + ')');  
      } else {
        event.deleteEvent();
        Log_.info('Deleted event "' + name + '" (' + event.getStartTime() + ')');
      }        
    
      events = calendars[0].getEvents(start, end);  

    } // while still events 
    
  }); // for each calendar
  
  Log_.info('Finished deleting calendar events');
     
} // deleteEvents_()