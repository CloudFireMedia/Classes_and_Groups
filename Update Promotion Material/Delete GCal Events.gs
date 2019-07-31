function ShowDeletePopup_() {
  var ui = DocumentApp.getUi(),
      tmpl = HtmlService.createTemplateFromFile('Update Promotion Material/Delete.html'),
      all_calendars = CalendarApp.getAllCalendars(),
      calendars = [];
  
  for (var index in all_calendars) {
    var calendar = all_calendars[index];  
    calendars.push(calendar.getName());
  }
  
  tmpl.content = {
    'calendars': calendars
  };
  
  var html = tmpl.evaluate().setWidth(520).setHeight(240);  
  ui.showModalDialog(html, 'Delete settings');
}

function DeleteEvents_(calendars_names) {
  var doc = getDoc_(),
      title = doc.getName(),
      year = 1970,
      month = 0,
      day = 1,
      res = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);
  
  if (res.length == 4) {
    year = parseInt(res[1], 10);
    month = parseInt(res[2], 10) - 1;
    day = parseInt(res[3], 10);
  }
  
  var start = new Date(year, month, day, 0, 0, 0),
      end = new Date((year + 1), month, day, 0, 0, 0);
  
  for (var i = 0; i < calendars_names.length; i++) {
    var calendar = CalendarApp.getCalendarsByName(calendars_names[i]),
        events = calendar[0].getEvents(start, end);
    
    while (events.length > 0) {
      var event = events[0];
      
      if (event.isRecurringEvent()) {
        event.getEventSeries().deleteEventSeries();
      } else {
        event.deleteEvent();
      }
      
      events = calendar[0].getEvents(start, end);
    }
  }
  
} // DeleteEvents_()