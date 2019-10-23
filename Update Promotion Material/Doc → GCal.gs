/**
 * Show the popup to get the event export config from the user
 */

function showExportPopup_() {
  var calendarNames = CalendarApp.getAllCalendars().map(function(calendar) {
    return calendar.getName();    
  })

  var template = HtmlService.createTemplateFromFile('Update Promotion Material/Export.html');

  template.content = {
    'calendars': calendarNames
  };
  
  var html = template.evaluate().setWidth(520).setHeight(530);
  DocumentApp.getUi().showModalDialog(html, 'Export settings');
  
} // showExportPopup_()

/**
 * Export events from the C&G GDoc to a GCal
 */

function exportEvents_(settings) {
  var logSheet = logInit_()
  
  var regularCalendar = settings.regular_events_calendar
  var regularEventsCalendars = CalendarApp.getCalendarsByName(regularCalendar);
  
  if (regularEventsCalendars.length > 1) {
    throw new Error('Multiple calendars called: "' + regularCalendar + '"');
  }
  
  var regularEventsCalendar = regularEventsCalendars[0]
  
  var newCalendar = settings.new_events_calendar
  var newEventsCalendars = CalendarApp.getCalendarsByName(newCalendar);
  
  if (newEventsCalendars.length > 1) {
    throw new Error('Multiple calendars called: "' + newCalendar + '"');
  }
    
  var newEventsCalendar =   newEventsCalendars[0]
    
  var events = parseEvents();    
  var exclusionDates = getExclusionDates(); 
  addEventsToCalendar();
  excludeEvents([regularEventsCalendar, newEventsCalendar]);  
  return;
  
  // Private Functions
  // -----------------
  
  function parseEvents() {
  
    var populateDays = settings.populate_days;
    var ui = getUi_();
    var doc = getDoc_();    
    var docDate = getDateTimeFromDocTitle_(doc.getName());
    var body = doc.getBody();
    var paragraphs = body.getParagraphs();
    
    var events = [];
    var eventHeadingDay = null; 
    var timeFrame = null;
    var heading3 = null;

    var foundOtherEvents = false;   
    
    paragraphs.forEach(function(paragraph, paragraphIndex) {    
      var text = paragraph.getText().trim();
      var heading = paragraph.getHeading();
      
      if (text.toUpperCase() === 'OTHER EVENTS') {
        foundOtherEvents = true;
      }

      if (foundOtherEvents) {    
      
        processOtherEvents() 
        
      } else { // Daily classes
      
        switch (heading) {
        
            // day of the week
          case DocumentApp.ParagraphHeading.HEADING1: {
            processHeading1();
            break;
          }
            // time
          case DocumentApp.ParagraphHeading.HEADING2: {
            timeFrame = processHeading2();
            break;          
          }
            // title & location
          case DocumentApp.ParagraphHeading.HEADING3: {
            heading3 = processHeading3();
            break;
          }
            /* Heading 4 = event description paragraph NOT immediately followed by an event details paragraph.

                Example:

                Tuesday Morning Prayer Group | Room 123
                Come to pray and to receive prayer.
                Show less

            
            Heading 5 = 'event description paragraph' immediately followed by an 'event details paragraph' (Heading 6).

                Example:

                Midweek Hymns + Teaching | Prayer Tower
                All are welcome to join our senior community for a service of hymn singing and biblical teaching from our pastoral staff.
                >> Ongoing
             */          
          case DocumentApp.ParagraphHeading.HEADING4:
          case DocumentApp.ParagraphHeading.HEADING5: {
            processHeading45();
            break;
          }
          
          case DocumentApp.ParagraphHeading.HEADING6: {
            // Heading 6 is dealt with in processHeading45()
            break;
          }
          
          default:
            throw new Error('Unexpected format: ' +  heading)
          
        } // switch (heading)
        
      } // ! other event
      
      // Private Functions
      // -----------------
      
      /**
       * If this is the second or more time that a heading has been found
       * inc the date this class is happening on
       */
  
      function processHeading1() {
        
        if (eventHeadingDay !== null) {
          docDate.setDate(docDate.getDate() + 1);
        }
        
        eventHeadingDay = text.toLowerCase().trim();
        
      } // exportEvents_.parseEvents.processDailyEvents.processHeading1
      
      function processHeading2() {
        
        var time = text.toUpperCase().trim();
        var finds = time.match(/^([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})\s*[–\-]\s*([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})$/);    
        var timeFrame = null
        
        if (finds !== null) {
          if (finds.length === 7) {
            timeFrame = {
              'start': {
                'hours': to24Hours_(Number(finds[1]), finds[3]),
                'minutes': Number(finds[2])
              },
              'end': {
                'hours': to24Hours_(Number(finds[4]), finds[6]),
                'minutes': Number(finds[5])
              },
            };
          }
        }
        
        if (timeFrame === null) {
          throw new Error('Heading2 must only be used for the time frame');
        }
        
        return timeFrame;
        
      } // exportEvents_.parseEvents.processDailyEvents.processHeading2
      
      function processHeading3() {
        
        var header = text.split('|');
        var title;
        var location;
        
        if (header.length === 2) {
        
          title = header[0].trim();
          location = header[1].trim();
          
        } else if (header.length === 3) {
        
          title = header[0].trim();
          location = header[2].trim();
          
        } else {
        
          throw new Error('Bad Heading3 format. Expected "[title] | [ ... | location] | [location]"')
        }
        
        return {
          title: title,
          location: location
        }
        
      } // exportEvents_.parseEvents.processDailyEvents.processHeading3
      
      function processHeading45() {
        
        var description = text.trim();
        var paragraphDate = paragraphs[paragraphIndex + 1];
        var curYear = docDate.getFullYear();
        var curMonth = docDate.getMonth();
        var curDay = docDate.getDate();
        
        var dates = {
          'start': new Date(curYear, curMonth, curDay, timeFrame.start.hours, timeFrame.start.minutes),
          'end': new Date(curYear, curMonth, curDay, timeFrame.end.hours, timeFrame.end.minutes)
        };
        
        var conditions;
        
        if (paragraphDate.getHeading() === DocumentApp.ParagraphHeading.HEADING6) {
          processHeading6();
        }
                
        var dayName = DAYS_OF_WEEK_[dates.start.getDay()].toLowerCase();
        
        if (populateDays.indexOf(dayName) !== -1) {
          events.push({
            'title': heading3.title,
            'description': '<b>What\'s it all about?</b> '+ description + 
            ' <br><br><b>Contact:</b> Greg Brewer at <a href="mailto:greg.brewer@ccnash.org">greg.brewer@ccnash.org</a>',
            'location': heading3.location,
            'dates': dates,
            'recurrence': (conditions != null) ? 'MONTHLY' : 'WEEKLY',
            'conditions': conditions
          });
        }
        
        return 
        
        // Private Functions
        // -----------------
        
        function processHeading6() {
          
          var note = paragraphDate.getText().toUpperCase().trim();
          
          if (note.indexOf('>>') !== 0) {
            return;
          }
            
          note = note.substring(3);
          
          // Look for "Starts [month] [day]", e.g. "Start January 4".
          var finds = note.match(/^STARTS\s*(\w+)\s*([0-9]{1,2})/);
          
          if (finds !== null && finds.length === 3) {
          
            var month = MONTHS_.indexOf(finds[1].toUpperCase());
            var day = Number(finds[2]);
            
            dates = {
              'start': new Date(curYear, month, day, timeFrame.start.hours, timeFrame.start.minutes),
              'end': new Date(curYear, month, day, timeFrame.end.hours, timeFrame.end.minutes)
            };
          }
          
          // Look for "[month] [day] - [month] [day][.|;]", e.g. "April 1 - May 1."
          finds = note.match(/^(\w+)\s*([0-9]{1,2})\s*[–\-]\s*(\w+)\s*([0-9]{1,2})[.;]{0,1}/);
          
          if (finds !== null && finds.length == 5) {
          
            var startMonth = MONTHS_.indexOf(finds[1].toUpperCase());
            var startDay   = Number(finds[2]);
            var endMonth   = MONTHS_.indexOf(finds[3].toUpperCase());
            var endDay     = Number(finds[4]);
            
            dates = {
              'start': new Date(curYear, startMonth, startDay, timeFrame.start.hours, timeFrame.start.minutes),
              'end': new Date(curYear, startMonth, startDay, timeFrame.end.hours, timeFrame.end.minutes),
              'finish': new Date(curYear, endMonth, endDay)
            };
          }
          
          // Look for "[number][ST|ND|RD|TH] [day of the week] OF THE MONTH", e.g. "1ST SUNDAY OF THE MONTH". 
          finds = note.match(/^(([1-4]{1})(ST|ND|RD|TH))\s(SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)\sOF\sTHE\sMONTH/);
          
          if (finds !== null && finds.length === 5) {
            conditions = {
              'queue': Number(finds[2]),
              'day': finds[4]
            };
          }
  
        } // exportEvents_.parseEvents.processDailyEvents.processHeading45.processHeading6
  
      } // exportEvents_.parseEvents.processDailyEvents.processHeading45
  
      function processOtherEvents() {
        
        switch (heading) {
  
            // "OTHER EVENTS" heading
          case DocumentApp.ParagraphHeading.HEADING1: {
            // Nothing to do 
            break;
          }
          
            // title & location
          case DocumentApp.ParagraphHeading.HEADING3: {
            heading3 = processHeading3(text)
            break;
          }
          
            // description
          case DocumentApp.ParagraphHeading.HEADING4:
          case DocumentApp.ParagraphHeading.HEADING5: {
            processHeading45()
            break;
          }
          
            // recurrence
          case DocumentApp.ParagraphHeading.HEADING6: {
            // Dealt with in processHeading45()
            break;
          }
          
          default: {
            throw new Error('Unexpected heading type: ' + heading)
          }
        }
        
        return;
        
        // Private Functions
        // -----------------
        
        function processHeading45() {
          
          var description = text.trim();
          var paragraphDate = paragraphs[paragraphIndex + 1];
          var curYear = docDate.getFullYear();
          var dates = null;
          
          if (paragraphDate.getHeading() !== DocumentApp.ParagraphHeading.HEADING6) {
            throw new Error('No Heading 6 date for "' + description + '"')
          }
          
          var note = paragraphDate.getText().toUpperCase().trim();
          
          if (note.indexOf('>>') === 0) {
          
            note = note.substring(3);
            
            // Look for "Starts at [number]", e.g. "Starts at 2"
            var finds = note.match(/^STARTS\s*(\w+)\s*([0-9]{1,2})/);
            
            if (finds != null && finds.length == 3) {
            
              var month = MONTHS_.indexOf(finds[1].toUpperCase()),
                  day = Number(finds[2]);
              
              dates = {
                'start': new Date(curYear, month, day, 0, 0),
                'end': new Date(curYear, month, day, 24, 0)
              };
            }
            
            // Look for "[some text], [month] [day] at [hour]:[minute][am|pm]", e.g. "hello, May 1 at 1:00pm"
            finds = note.match(/^\w+\,\s*(\w+)\s*([0-9]{1,31})\s*AT\s*(?:([0-9]{1,2})|([0-9]{1,2})\:([0-9]{1,2}))([AM|PM]{2})$/);
            
            if (finds !== null && finds.length == 7) {
            
              var month = MONTHS_.indexOf(finds[1].toUpperCase());
              
              if (month === -1) {
                throw new Error('Could not find "OTHER EVENTS" month ' + finds[1])
              }
              
              var day = Number(finds[2]);
              var hours;
              var minutes = 0;
              
              if (finds[3] != null) {
                hours = to24Hours_(Number(finds[3]), finds[6]);
              } else if (finds[4] != null && finds[5] != null) {
                hours = to24Hours_(Number(finds[4]), finds[6]);
                minutes = finds[5];
              }
              
              dates = {
                'start': new Date(curYear, month, day, hours, minutes),
                'end': new Date(curYear, month, day, (hours + 1), minutes)
              };
            }          
          }
          
          if (dates !== null) {
          
            var dayName = DAYS_OF_WEEK_[dates.start.getDay()].toLowerCase();
            
            if (populateDays.indexOf(dayName) >= 0) {
            
              events.push({
                'title': heading3.title,
                'description': '<b>What\'s it all about?</b> '+ description + 
                ' <br><br><b>Contact:</b> Greg Brewer at <a href="mailto:greg.brewer@ccnash.org">greg.brewer@ccnash.org</a>',
                'location': heading3.location,
                'dates': dates,
                'recurrence': 'ONCE'
              });
            }
            
          } else {
          
            log_(logSheet, 'No dates assigned for "' + description + '"')
          }
          
        } // exportEvents_.parseEvents.processOtherEvents.processHeading45()
              
      } // exportEvents_.parseEvents.processOtherEvents()
       
    }) // for each paragraph
    
    return events;
    
  } // exportEvents_.parseEvents()

  function addEventsToCalendar() {
  
    for (var index in events) {
    
      if (!events.hasOwnProperty(index)) {
        continue;
      }
    
      var event = events[index];
      var calendar = event.title.toUpperCase().indexOf('NEW!') === 0 ? newEventsCalendar : regularEventsCalendar;
      var options = {
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
        default: {
          throw new Error('Bad recurrence type')
        }
        
      } // switch(recurrence)
      
    } // for each event
    
  } // exportEvents_.addEventsToCalendar()
  
  function getExclusionDates() {
    var doc = getDoc_();    
    var docDate = getDateTimeFromDocTitle_(doc.getName());
    
    if (docDate.getYear() !== 2019) {
      throw new Error('"Exclude dates" only support 2019 at the moment');
    }
    
    var ss = SpreadsheetApp.openById(Config.get('PROMOTION_DEADLINES_CALENDAR_ID'));
    var sheet = ss.getSheetByName('Calendar Exceptions');
    var holidays = sheet.getRange('A6:A').getValues();
    var startDates = sheet.getRange('C6:C').getValues(); // 2019
    var endDates = sheet.getRange('D6:D').getValues();
    var statuses = sheet.getRange('T6:T').getValues();
    var excludedDates = [];
    
    // Create and array of all the excluded dates (with duplicates)
    holidays.forEach(function(holiday, rowIndex) {
      if (statuses[rowIndex][0] === 'suspended') {
        var startDate = startDates[rowIndex][0];
        var endDate = endDates[rowIndex][0];        
        var nextDate = startDate;        
        do {
          excludedDates.push(nextDate);
          nextDate = new Date(nextDate.getYear(), nextDate.getMonth(), nextDate.getDate() + 1);
        } while (nextDate < endDate) 
      }
    })
    
    // Remove duplicates
    var unique = {};
    excludedDates.forEach(function(date) {
      if(!unique.hasOwnProperty(date)) {
        unique[date] = date;
      }
    });
    
    var uniqueArray = []
    
    for (var key in unique) {    
      if (!unique.hasOwnProperty(key)) {
        continue;
      }
      uniqueArray.push(unique[key]);
    }
    
    return uniqueArray;
    
  } // exportEvents_.getExclusionDates()

  function excludeEvents(calendars) {
    var logSheet = logInit_();
    exclusionDates.forEach(function(date) {
      calendars.forEach(function(calendar) {
		calendar.getEventsForDay(date).forEach(function(event) {
          event.deleteEvent();
          log_(logSheet, 'Removed event for ' + date);
        })
      })
    })    
  } // exportEvents_.excludeEvents()

//  function getExclusionDates_OLD(url) {
//  
//    var ss = Config.get('PROMOTION_DEADLINES_CALENDAR_ID');
//    var sheet = ss.getSheetByName('Calendar Exceptions');
//    var ranges = sheet.getRangeList(['A6:A', 'D5:D', 'H5:S']).getRanges();
//    var titles = ranges[0].getValues();
//    var values = ranges[1].getValues();
//    var periods = ranges[2].getValues();
//    var dates = [];
//    
//    for (var i = 0; i < titles.length; i++) {
//    
//      var title = String(titles[i][0]).trim();
//      var value = String(values[i][0]).toLowerCase().trim();
//      
//      if (value !== 'yes') {
//        continue;
//      }
//      
//      var start;
//      var end;
//      
//      for (var col = 0; col < periods[i].length; col++) {
//        
//        if (!isNaN(periods[i][col])) {
//          
//          if ((col + 1) % 2 != 0) {
//            
//            start = new Date(periods[i][col]);
//            
//          } else {
//            
//            end = new Date(periods[i][col]);
//            
//            if (start < end) {
//              
//              var startTS = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
//              var endTS   = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
//              var days    = Math.floor((endTS - startTS) / NUMBER_OF_MS_IN_A_DAY_);
//              
//              for (var j = 0; j <= days; j++) {
//                
//                var date = new Date(start);
//                
//                date.setDate(date.getDate() + j);
//                
//                if (!isInArray_(dates, date)) {
//                  dates.push(date);
//                }
//              }
//              
//            } else {
//              
//              if (!isInArray_(dates, start)) {
//                dates.push(start);
//              }
//            }
//          }
//        }
//        
//      } // for each col
//      
//    } // for each day
//    
//    return dates;
//    
//  } // exportEvents_.getExclusionDates()
      
} // exportEvents_()