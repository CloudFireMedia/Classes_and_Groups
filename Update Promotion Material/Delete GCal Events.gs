function ShowDeletePopup_() {

  var ui = DocumentApp.getUi();
  var tmpl = HtmlService.createTemplateFromFile('Update Promotion Material/Delete.html');
  var all_calendars = CalendarApp.getAllCalendars();
  var calendars = [];
  
  for (var index in all_calendars) {
    var calendar = all_calendars[index];  
    calendars.push(calendar.getName());
  }
  
  tmpl.content = {
    'calendars': calendars
  };
  
  var html = tmpl.evaluate().setWidth(520).setHeight(240);  
  ui.showModalDialog(html, 'Delete settings');
  
} // ShowDeletePopup_()

function DeleteEvents_(calendars_names) {

  var doc = getDoc_();
  var title = doc.getName();
  
  // Look for "[yyyy.MM.dd]", e.g. 2019.01.19, in the document's title
  var res = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);
  
  if (res.length !== 4) {
    throw new Error('No date in doc title: [yyyy.MM.dd]')
  }
  
  var year = parseInt(res[1], 10);
  var month = parseInt(res[2], 10) - 1;
  var day = parseInt(res[3], 10);
  
  var start = new Date(year, month, day, 0, 0, 0);
  var end = new Date((year + 1), month, day, 0, 0, 0);
  
  for (var i = 0; i < calendars_names.length; i++) {
  
    var calendar = CalendarApp.getCalendarsByName(calendars_names[i]);
    var events = calendar[0].getEvents(start, end);
    
    while (events.length > 0) {
    
      var event = events[0];
      
      if (event.isRecurringEvent()) {
        event.getEventSeries().deleteEventSeries();
      } else {
        event.deleteEvent();
      }
      
      // AJR: Not sure why this would be repeatedly called??
      events = calendar[0].getEvents(start, end);
    }
    
  } // for each calendar
  
} // DeleteEvents_()