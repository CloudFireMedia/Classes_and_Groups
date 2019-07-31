// created by Mikhail K. on freelancer.com

function ShowExportPopup_() {
  var ui = DocumentApp.getUi(),
      tmpl = HtmlService.createTemplateFromFile('Update Promotion Material/Export.html'),
      all_calendars = CalendarApp.getAllCalendars(),
      calendars = [];
  
  for (var index in all_calendars) {
    var calendar = all_calendars[index];
    
    calendars.push(calendar.getName());
  }
  
  tmpl.content = {
    'calendars': calendars
  };
  
  var html = tmpl.evaluate().setWidth(520).setHeight(640);
  ui.showModalDialog(html, 'Export settings');
}

function ExportEvents_(settings) {

  console.log(settings)

  var regularEventsCalendars = CalendarApp.getCalendarsByName(settings.regular_events_calendar);
  var newEventsCalendars     = CalendarApp.getCalendarsByName(settings.new_events_calendar);
  var events                 = ParseEvents(settings.populate_days);
//  var exclusion_dates        = GetExclusionDates(settings.exclude_dates_ss_url);
  
  AddEventsToCalendar(regularEventsCalendars[0], newEventsCalendars[0], events);
//  ExcludeEvents([regularEventsCalendars[0], newEventsCalendars[0]], exclusion_dates);
  return
  
  // Private Functions
  // -----------------
  
  function AddEventsToCalendar(regularEventsCalendar, newEventsCalendar, data) {
    for (var index in data) {
      var event = data[index],
          calendar = event.title.toUpperCase().indexOf('NEW!') < 0 ? regularEventsCalendar : newEventsCalendar,
            options = {
              location: event.location,
              description: event.description
            };
      
      switch (event.recurrence) {
        case 'MONTHLY': {
          if (event.conditions != null) {
            var recurrence = CalendarApp.newRecurrence().addWeeklyRule(),
                startDay = (7 * (event.conditions.queue - 1)),
                  excludeDays = [];
            
            for (var i = 1; i <= 31; i++) {
              excludeDays.push(i);
            }
            
            excludeDays.splice(excludeDays.indexOf(startDay + 1), 7);
            
            recurrence.addMonthlyExclusion()
            .onlyOnMonthDays(excludeDays)
            .onlyOnWeekday(CalendarApp.Weekday[event.conditions.day]);
            
            if (event.dates['finish'] != null) {
              recurrence.until(event.dates.finish);
            }
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
        case 'WEEKLY': {
          var recurrence = CalendarApp.newRecurrence().addWeeklyRule();
          
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
    
  } // ExportEvents_.AddEventsToCalendar()
  
  function ExcludeEvents(calendars, exclusion_dates) {
    for (var index in exclusion_dates) {
      var date = exclusion_dates[index];
      
      for (var i = 0; i < calendars.length; i++) {
        var events = calendars[i].getEventsForDay(date);
        
        for (var j = 0; j < events.length; j++) {
          events[j].deleteEvent();
        }
      }
    }
    
  } // ExportEvents_.ExcludeEvents()
  
  function GetExclusionDates(url) {
  
    var ss = Config.get('PROMOTION_DEADLINES_CALENDAR_ID');
    var sheet = ss.getSheetByName(Config.get('BLACKOUT_DATES_DATA_SHEET_NAME'));
    var ranges = sheet.getRangeList(['A6:A', 'D5:D', 'H5:S']).getRanges();
    var titles = ranges[0].getValues();
    var values = ranges[1].getValues();
    var periods = ranges[2].getValues();
    var dates = [];
    
    for (var i = 0; i < titles.length; i++) {
      var title = String(titles[i][0]).trim(),
          value = String(values[i][0]).toLowerCase().trim();
      
      if (value == 'yes') {
        var start, end;
        
        for (var col = 0; col < periods[i].length; col++) {
          if (!isNaN(periods[i][col])) {
            if ((col + 1) % 2 != 0) {
              start = new Date(periods[i][col]);
            } else {
              end = new Date(periods[i][col]);
              
              if (start < end) {
                var startTS = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()),
                    endTS = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()),
                    days = Math.floor((endTS - startTS) / (1000*60*60*24));
                
                for (var j = 0; j <= days; j++) {
                  var date = new Date(start);
                  
                  date.setDate(date.getDate() + j);
                  
                  if (!isInArray(dates, date)) {
                    dates.push(date);
                  }
                }
              } else {
                if (!isInArray(dates, start)) {
                  dates.push(start);
                }
              }
            }
          }
        }
      }
    }
    
    return dates;
    
    // Private Functions
    // -----------------
    
    function isInArray(arr, obj) {
      for (var i = 0; i < arr.length; i++) {
        if (+arr[i] === +obj) {
          return true;
        }
      }  
      return false;
      
    } // ExportEvents_.GetExclusionDates.isInArray()
    
  } // ExportEvents_.GetExclusionDates()
    
  function ParseEvents(populate_days) {
  
    var ui = getUi_();
    var doc = getDoc_();
    var body = doc.getBody();
    var paragraphs = body.getParagraphs();
    var docName = doc.getName();
    var docDates = docName.match(/^\[\s([0-9]{4})\.([0-9]{2})\.([0-9]{2})\s\]/);
    var docYear = Number(docDates[1]);
    var docMonth = Number(docDates[2]) - 1;
    var docDay = Number(docDates[3]);
    var docDate = new Date(docYear, docMonth, docDay);
    var months = [
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
    ];
    var dayweek = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY'
    ];
    var data = [];
    var isOtherEvents = false;
    var day; 
    var timeFrame;
    var location; 
    var title;
    
    for (var i=0; i < paragraphs.length; i++) {
      var paragraph = paragraphs[i];
          text = paragraph.getText().trim(),
          heading = paragraph.getHeading();
      
      if (text.toUpperCase() == 'OTHER EVENTS') {
        isOtherEvents = true;
      }
      
      if (!isOtherEvents) {
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
                },
                conditions;
            
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
                
                founds = note.match(/^(([1-4]{1})(ST|ND|RD|TH))\s(SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)\sOF\sTHE\sMONTH/);
                
                if (founds != null) {
                  if (founds.length == 5) {
                    conditions = {
                      'queue': Number(founds[2]),
                      'day': founds[4]
                    };
                  }
                }
              }
            }
            
            if (dates != null) {
              var dayName = dayweek[dates.start.getDay()].toLowerCase();
              
              if (populate_days.indexOf(dayName) >= 0) {
                data.push({
                  'title': title,
                  'description': '<b>What\'s it all about?</b> '+ description + 
                    ' <br><br><b>Contact:</b> Greg Brewer at <a href="mailto:greg.brewer@ccnash.org">greg.brewer@ccnash.org</a>',
                  'location': location,
                  'dates': dates,
                  'recurrence': (conditions != null) ? 'MONTHLY' : 'WEEKLY',
                  'conditions': conditions
                });
              }
            }
            
            break;
          }
        }
      } else {
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
                curYear = docDate.getFullYear(),
                dates;
            
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
                var dayName = dayweek[dates.start.getDay()].toLowerCase();
                
                if (populate_days.indexOf(dayName) >= 0) {
                  data.push({
                    'title': title,
                    'description': '<b>What\'s it all about?</b> '+ description + 
                      ' <br><br><b>Contact:</b> Greg Brewer at <a href="mailto:greg.brewer@ccnash.org">greg.brewer@ccnash.org</a>',
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
    
    // Private Functions
    // -----------------
    
    function to24Hours(hours, period) {
      if (period == 'AM' && hours == 12) {
        hours = 0;
      } else if (period == 'PM' && hours < 12) {
        hours = hours + 12;
      }
      return hours;
      
    } // ExportEvents_.ParseEvents.to24Hours()
    
  } // ExportEvents_.ParseEvents()
  
} // ExportEvents_()