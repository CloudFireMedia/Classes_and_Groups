// jshint: 28Oct2019

/**
 * Show the popup to get the event export config from the user
 */

function showExportPopup_() {
  var doc = Utils.getDoc(TEST_DOC_ID_);
  var docDate = getDateTimeFromDocTitle_(doc.getName());
  
  if (docDate === null) {
    throw new Error('No date in doc title: [ yyyy.MM.dd ]: ' + doc.getName());
  }
  
  var body = doc.getBody();
  var paragraphs = body.getParagraphs();
  
  if (paragraphs[0].getText() !== 'SUNDAY') {
    throw new Error('The doc must start with "SUNDAY" as the only word in the first paragraph');
  }

  var calendarNames = CalendarApp.getAllCalendars().map(function(calendar) {
    return calendar.getName();    
  });

  var template = HtmlService
    .createTemplateFromFile('Update Promotion Material/Export.html');

  template.content = {
    calendars: calendarNames
  };
  
  var html = template.evaluate().setWidth(520).setHeight(560);
  DocumentApp.getUi().showModalDialog(html, 'Export settings');
  
} // showExportPopup_()

/**
 * Export events from the C&G GDoc to a GCal
 */

function exportEvents_(settings) {

  var regularCalendar = settings.regular_events_calendar;
  var regularEventsCalendars = CalendarApp.getCalendarsByName(regularCalendar);
  
  if (regularEventsCalendars.length > 1) {
    throw new Error('Multiple calendars called: "' + regularCalendar + '"');
  }
  
  var regularEventsCalendar = regularEventsCalendars[0];
  
  var newCalendar = settings.new_events_calendar;
  var newEventsCalendars = CalendarApp.getCalendarsByName(newCalendar);
  
  if (newEventsCalendars.length > 1) {
    throw new Error('Multiple calendars called: "' + newCalendar + '"');
  }
    
  var newEventsCalendar = newEventsCalendars[0];
  var events = parseEvents();
  addEventsToCalendar();
  excludeEvents([regularEventsCalendar, newEventsCalendar]); 
  
  var message = 'Export finished: ' + events.length + ' events created.';
  Log_.info(message);
  return message;
  
  // Private Functions
  // -----------------
  
  /**
   * Convert the C&G GDoc into an array of GCal event objects
   */
  
  function parseEvents() {  
    var populateDays = settings.populate_days;
    
    if (populateDays === undefined) {
      throw new Error('No days selected')
    }
    
    var doc = Utils.getDoc(TEST_DOC_ID_);
    var docDate = getDateTimeFromDocTitle_(doc.getName());
    
    if (docDate === null) {
      throw new Error('No date in doc title: [ yyyy.MM.dd ]: ' + doc.getName());
    }
     
    docDate = getDateOnThisDay_(docDate, 'Sunday');
    var body = doc.getBody();
    var paragraphs = body.getParagraphs();
    var events = [];
    var eventHeadingDay = null; 
    var timeFrame = null;
    var heading3 = null;
    var foundOtherEvents = false;
    
    if (paragraphs[0].getText() !== 'SUNDAY') {
      throw new Error('The doc must start with "SUNDAY" as the only word in the first paragraph');
    }
    
    paragraphs.forEach(function(paragraph, paragraphIndex) {    
      var text = paragraph.getText().trim();
      Log_.fine('Paragraph: "' + text + '"'); 
      var heading = paragraph.getHeading();
      
      if (text.toUpperCase() === 'OTHER EVENTS') {
        foundOtherEvents = true;
      }

      if (foundOtherEvents) {    
      
        processOtherEvents();
        
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
            
          default: {
            throw new Error('Unexpected format: ' +  heading);
          }
          
        } // switch (heading)
        
      } // ! other event
      
      return;
      
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
        timeFrame = null;
        
      } // exportEvents_.parseEvents.processDailyEvents.processHeading1
      
      function processHeading2() {        
        var time = text.toUpperCase().trim();
        var finds = time.match(/^([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})\s*[–\-]\s*([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})$/);    
        var timeFrame;
        
        if (finds !== null && finds.length === 7) {
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
        } else {
          throw new Error('Heading2 must only be used for the time frame');
        }
        
        return timeFrame;
        
      } // exportEvents_.parseEvents.processDailyEvents.processHeading2()
      
      function processHeading3() {   
        if (timeFrame === null) {
          throw new Error('Should have found a time frame before the event description.')
        }
      
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
        
          throw new Error('Bad Heading3 format. Expected "[title] | [ ... | location] | [location]"');
        }
        
        return {
          title: title,
          location: location
        };
        
      } // exportEvents_.parseEvents.processDailyEvents.processHeading3
      
      function processHeading45() {
        
        var description = text.trim();
        var paragraphDate = paragraphs[paragraphIndex + 1];
        var currentYear = docDate.getFullYear();
        var currentMonth = docDate.getMonth();
        var currentDay = docDate.getDate();
        var conditions = null;
        var dates;
        
        if (paragraphDate.getHeading() === DocumentApp.ParagraphHeading.HEADING6) {
        
          [dates, conditions] = processHeading6(docDate, paragraphDate, currentYear, timeFrame);
          
        } else {
        
          dates = {
            'start': new Date(currentYear, currentMonth, currentDay, timeFrame.start.hours, timeFrame.start.minutes),
            'end': new Date(currentYear, currentMonth, currentDay, timeFrame.end.hours, timeFrame.end.minutes)
          };        
        }
                
        if (dates === null) {
        
          dates = {
            'start': new Date(currentYear, currentMonth, currentDay, timeFrame.start.hours, timeFrame.start.minutes),
            'end': new Date(currentYear, currentMonth, currentDay, timeFrame.end.hours, timeFrame.end.minutes)
          };
        }
                
        var dayName = DAYS_OF_WEEK_[dates.start.getDay()].toLowerCase();
        
        if (heading3 === null) {
          throw new Error('Processing H4/5 before H3');
        }
        
        var contactText = '<br><br><b>Contact:</b> ' + CONTACT_NAME_ + ' at ' + 
          '<a href="mailto:' + CONTACT_EMAIL_ + '">' + CONTACT_EMAIL_+ '</a>';
        
        if (populateDays.indexOf(dayName) !== -1) {
          events.push({
            'title': heading3.title,
            'description': '<b>What\'s it all about?</b> '+ description + 
            contactText,
            'location': heading3.location,
            'dates': dates,
            'recurrence': (conditions != null) ? 'MONTHLY' : 'WEEKLY',
            'conditions': conditions
          });
        }
                
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
            heading3 = processHeading3(text);
            break;
          }
          
            // description
          case DocumentApp.ParagraphHeading.HEADING4:
          case DocumentApp.ParagraphHeading.HEADING5: {
            processHeading45();
            break;
          }
          
            // recurrence
          case DocumentApp.ParagraphHeading.HEADING6: {
            // Dealt with in processHeading45()
            break;
          }
          
          default: {
            throw new Error('Unexpected heading type: ' + heading);
          }
        }
        
        return;
        
        // Private Functions
        // -----------------
        
        function processHeading45() {
          
          var description = text.trim();
          var paragraphDate = paragraphs[paragraphIndex + 1];
          var currentYear = docDate.getFullYear();
          var dates = null;
          var month;
          var day;
          
          if (paragraphDate.getHeading() !== DocumentApp.ParagraphHeading.HEADING6) {
            throw new Error('No Heading 6 date for "' + description + '"');
          }
          
          var note = paragraphDate.getText().toUpperCase().trim();
          
          if (note.indexOf('>>') === 0) {
          
            note = note.substring(3);
            
            // Look for "Starts at [number]", e.g. "Starts at 2"
            var finds = note.match(/^STARTS\s*(\w+)\s*([0-9]{1,2})/);
            
            if (finds != null && finds.length == 3) {
            
              month = MONTHS_.indexOf(finds[1].toUpperCase());
              day = Number(finds[2]);
              
              dates = {
                'start': new Date(currentYear, month, day, 0, 0),
                'end': new Date(currentYear, month, day, 24, 0)
              };
              
            } else {
            
              // Look for "[some text], [month] [day] at [hour]:[minute][am|pm]", e.g. "hello, May 1 at 1:00pm"
              finds = note.match(/^\w+\,\s*(\w+)\s*([0-9]{1,31})\s*AT\s*(?:([0-9]{1,2})|([0-9]{1,2})\:([0-9]{1,2}))([AM|PM]{2})$/);
              
              if (finds !== null && finds.length == 7) {
              
                month = MONTHS_.indexOf(finds[1].toUpperCase());
                
                if (month === -1) {
                  throw new Error('Could not find "OTHER EVENTS" month ' + finds[1]);
                }
                
                day = Number(finds[2]);
                var hours;
                var minutes = 0;
                
                if (finds[3] != null) {
                  hours = to24Hours_(Number(finds[3]), finds[6]);
                } else if (finds[4] != null && finds[5] != null) {
                  hours = to24Hours_(Number(finds[4]), finds[6]);
                  minutes = finds[5];
                }
                
                dates = {
                  'start': new Date(currentYear, month, day, hours, minutes),
                  'end': new Date(currentYear, month, day, (hours + 1), minutes)
                };
              }          
            }
            
          } // heading 6
          
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
          
            Log_.info('No dates assigned for "' + description + '"');
          }
          
        } // exportEvents_.parseEvents.processOtherEvents.processHeading45()
              
      } // exportEvents_.parseEvents.processOtherEvents()
       
    }); // for each paragraph
    
    return events;
    
  } // exportEvents_.parseEvents()

  function addEventsToCalendar() {
    var recurrence;
  
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
          if (event.conditions !== null) {
            recurrence = CalendarApp.newRecurrence().addWeeklyRule();
            var startDay = (7 * (event.conditions.queue - 1));
            var excludeDays = [];
            
            for (var i = 1; i <= 31; i++) {
              excludeDays.push(i);
            }
            
            excludeDays.splice(excludeDays.indexOf(startDay + 1), 7);
            
            recurrence.addMonthlyExclusion()
              .onlyOnMonthDays(excludeDays)
              .onlyOnWeekday(CalendarApp.Weekday[event.conditions.day]);
            
            if (event.dates.finish != null) {
              recurrence.until(event.dates.finish);
            }
          }
          
          if (TEST_CREATE_EVENTS_) {
          
            calendar.createEventSeries(
              event.title,
              event.dates.start,
              event.dates.end,
              recurrence,
              options
            );
            
            Log_.info('Created monthly event series "' + event.title + '"');
              
          } else {
            
            Log_.warning('Event create disabled "' + event.title + '"');
          }

          break;
        }
        
        case 'WEEKLY': {
          recurrence = CalendarApp.newRecurrence().addWeeklyRule();
          
          if (event.dates.finish != null) {
            recurrence.until(event.dates.finish);
          }

          if (TEST_CREATE_EVENTS_) {

            calendar.createEventSeries(
              event.title,
              event.dates.start,
              event.dates.end,
              recurrence,
              options
            );
 
            Log_.info('Created weekly event series "' + event.title + '"');          
 
          } else {
            
            Log_.warning('Event create disabled "' + event.title + '"');
          }
          
          break;
        }
        
        case 'ONCE': {
        
          if (TEST_CREATE_EVENTS_) {
       
            calendar.createEvent(
              event.title,
              event.dates.start,
              event.dates.end,
              options
            );
            
            Log_.info('Created one off event "' + event.title + '"');

          } else {
            
            Log_.warning('Event create disabled "' + event.title + '"');
          }

          break;
        }
        default: {
          throw new Error('Bad recurrence type');
        }
        
      } // switch(recurrence)
      
    } // for each event
    
  } // exportEvents_.addEventsToCalendar()
  
  function excludeEvents(calendars) {
  
    var exclusionDates = getExclusionDates();   
    
    for (var dateKey in exclusionDates) {
        
      if (!exclusionDates.hasOwnProperty(dateKey)) {
        continue;
      }
    
      var typeStatuses = exclusionDates[dateKey];
    
      calendars.forEach(function(calendar) {
      
		calendar.getEventsForDay(new Date(dateKey)).forEach(function(event) {
        
          var status = typeStatuses[getEventType()];
          Log_.fine('status: ' + status);
                  
          if (status === 'suspended') {    
            
            if (TEST_DELETE_EVENTS_) {
              
              event.deleteEvent();
              Log_.info('Deleted event"' + event.getTitle() + '" (' + dateKey + ')');  
              
            } else {
            
              Log_.warning('Event delete disabled: ' + event.getTitle());
            }  
          }
          
          return;
          
          // Private Functions
          // -----------------
          
          function getEventType() {
          
            var title = event.getTitle();
            Log_.fine('Title: ' + title);

            var type = EVENT_TYPES.VARIOUS.KEY;
            
            if (title.indexOf(EVENT_TYPES.NEWER.TEXT) !== -1) {           
              type = EVENT_TYPES.NEWER.KEY;              
            } else if (title.indexOf(EVENT_TYPES.SUNDAY.TEXT) !== -1) {            
              type = EVENT_TYPES.SUNDAY.KEY;            
            } else if (title.indexOf(EVENT_TYPES.HYMN.TEXT) !== -1) {            
              type = EVENT_TYPES.HYMN.KEY;
            } 
            
            Log_.fine('type: ' + type);
            return type;
            
          } // exportEvents_.excludeEvents.getEventType()         
          
        }); // for each event
        
      }); // for each calendar
      
    } // For each exclusion date
    
    return;
    
    // Private Functions
    // -----------------
    
    function getExclusionDates() {  
    
      if (!USE_EXCLUSION_DATES_) {
        return [];
      }
    
      var doc = Utils.getDoc(TEST_DOC_ID_);    
      var docDate = getDateTimeFromDocTitle_(doc.getName());
          
      if (docDate === null) {
        throw new Error('No date in doc title: [ yyyy.MM.dd ]: ' + doc.getName());
      }
   
      var docYear = docDate.getYear();
      
      if (docYear !== 2019 && docYear !== 2020) {
        throw new Error('"Exclude dates" only support 2019 and 2020 at the moment');
      }
              
      var ss = SpreadsheetApp.openById(Config.get('PROMOTION_DEADLINES_CALENDAR_ID'));
      var sheet = ss.getSheetByName('Calendar Exceptions');
      var lastRow = sheet.getLastRow()
      var holidays = sheet.getRange('A6:A' + lastRow).getValues();
      var startDatesRange = (docYear === 2019) ? 'C6:C' + lastRow : 'F6:F' + lastRow;
      var startDates = sheet.getRange(startDatesRange).getValues(); 
      var endDatesRange = (docYear === 2019) ? 'D6:D' + lastRow : 'G6:G' + lastRow;    
      var endDates = sheet.getRange(endDatesRange).getValues();
      var rules = sheet.getRange('L6:L' + lastRow ).getValues();      
      var newerStatuses = sheet.getRange('T6:T' + lastRow ).getValues();
      var variousStatuses = sheet.getRange('V6:V' + lastRow ).getValues();
      var sundayStatuses = sheet.getRange('X6:X' + lastRow ).getValues();
      var hymnStatuses = sheet.getRange('Y6:Y' + lastRow ).getValues();      
      var excludedDates = [];
      
      // Create an array of all the excluded dates (with duplicates) along with 
      // the status of that date for various event types
      
      holidays.forEach(function(holiday, rowIndex) {
      
        var startDate = startDates[rowIndex][0];
        var endDate = endDates[rowIndex][0];        
        var nextDate = startDate;
        var nextRule = rules[rowIndex][0];

        if (!getNextRule(startDate, endDate, nextRule)) {
          Log_.fine(startDate + ' failed rule "' + nextRule + '"')
          return;
        }

        do {
                        
          var nextStatus = {
            date: nextDate,
            status: {
              newer: newerStatuses[rowIndex][0],
              various: variousStatuses[rowIndex][0],
              sunday: sundayStatuses[rowIndex][0],
              hymn: hymnStatuses[rowIndex][0],
            }
          }         
          
          excludedDates.push(nextStatus);
          nextDate = new Date(nextDate.getYear(), nextDate.getMonth(), nextDate.getDate() + 1);
          
        } while (nextDate < endDate); 
        
      });
      
      return getUniqueDates();
      
      // Private Functions
      // -----------------

      /**
       * Process the rule for this holiday
       */
       
      function getNextRule(startDate, endDate, rule) {
      
        if (rule === 'true') {
          return true;
        }

        if (getDateInMs_(startDate) !== getDateInMs_(endDate)) {
        
          throw new Error(
            'Start Date: ' + startDate + ' - ' + 
            'End Date: ' + endDate + '. ' +          
            'Only holidays with the same start and end date are supported.');
        }
      
        var words = rule.split(' ');
        var ruleDayOfTheWeek;
        var nextDayofTheWeek = DAYS_OF_WEEK_[startDate.getDay()];
        var result;
        
        if (rule.indexOf('start and end date is any day of the week except ') === 0) {
        
          ruleDayOfTheWeek = words[11].trim().toUpperCase();
          result = (ruleDayOfTheWeek === nextDayofTheWeek) ? false : true;
                  
        } else if (rule.indexOf('start and end date is a ') === 0) {
        
          ruleDayOfTheWeek = words[6].trim().toUpperCase();
          result = (ruleDayOfTheWeek === nextDayofTheWeek) ? true : false;
                  
        } else {
        
          throw new Error('Invalid rule: "' + rule + '"');
        }
        
        Log_.finer('rule: "' + rule + '", date: ' + startDate + ', result: ' + result);
        return result;        
      }

      /**
       * Remove duplicates and supercede any other status with "suspended"
       */

      function getUniqueDates() {
      
        var unique = {};
        
        excludedDates.forEach(function(nextStatus) {
        
          var nextDate = nextStatus.date
          
          if (unique.hasOwnProperty(nextDate)) {
  
            var oldNewer = unique[nextDate].newer
            var oldVarious = unique[nextDate].various
            var oldSunday = unique[nextDate].sunday
            var oldHymn = unique[nextDate].hymn
          
            unique[nextDate] = {
              newer:   (oldNewer === 'suspended')   ? oldNewer   : nextStatus.status.newer,
              various: (oldVarious === 'suspended') ? oldVarious : nextStatus.status.various,
              sunday:  (oldSunday === 'suspended')  ? oldSunday  : nextStatus.status.sunday,
              hymn:    (oldHymn === 'suspended')    ? oldHymn    : nextStatus.status.hymn,
            }  
            
          } else {
                    
            unique[nextDate] = {
              newer: nextStatus.status.newer,
              various: nextStatus.status.various,
              sunday: nextStatus.status.sunday,
              hymn: nextStatus.status.hymn,
            }                      
          }
        });
        
        Log_.fine('unique: %s', unique);
        return unique;
        
      } // exportEvents_.excludeEvents.getExclusionDates.getUniqueDates()
             
    } // exportEvents_.excludeEvents.getExclusionDates()
    
  } // exportEvents_.excludeEvents()
  
  /**
   * This is really private to parseEvents() but the indentation was 
   * getting too deep
   */
      
  function processHeading6(docDate, paragraphDate, currentYear, timeFrame) {
    
    Log_.fine('docDate: ' + docDate);
    Log_.fine('currentYear: ' + currentYear);
    Log_.fine('timeFrame: %s', timeFrame);
    
    var note = paragraphDate.getText().toUpperCase().trim();
    Log_.fine('note: ' + note);

    if (note.indexOf('>>') !== 0) {
      return;
    }
    
    note = note.substring(3); // Jump past the '>>'
    
    var dates = null;
    var conditions = null;
    
    // Look for "Starts [month] [day]", e.g. "Start January 4".
    var finds = note.match(/^STARTS\s*(\w+)\s*([0-9]{1,2})/);
    
    if (finds !== null && finds.length === 3) {
      
      var month = MONTHS_.indexOf(finds[1].toUpperCase());
      var day = Number(finds[2]);
      
      if (timeFrame === null) {
        throw new Error('No time frame has been found yet.');
      }
      
      dates = {
        'start': new Date(currentYear, month, day, timeFrame.start.hours, timeFrame.start.minutes),
        'end': new Date(currentYear, month, day, timeFrame.end.hours, timeFrame.end.minutes)
      };
      
    } else {
      
      // Look for "[month] [day] - [month] [day][.|;]", e.g. "April 1 - May 1."
      finds = note.match(/^(\w+)\s*([0-9]{1,2})\s*[–\-]\s*(\w+)\s*([0-9]{1,2})[.;]{0,1}/);
      
      if (finds !== null && finds.length === 5) {
        
        var startMonth = MONTHS_.indexOf(finds[1].toUpperCase());
        var startDayOfMonth = Number(finds[2]);
        var endMonth = MONTHS_.indexOf(finds[3].toUpperCase());
        var endDayOfMonth = Number(finds[4]);
        
        // Find the first date on this day after "start"
        
        var presentStartDate = new Date(currentYear, startMonth, startDayOfMonth);
        
        if (presentStartDate < docDate) {
        
          throw new Error(
            'The start date in range "' + note + '" is earlier that the title date of ' + docDate);
        }
        
        var updatedStartDate = getDateOnThisDay_(presentStartDate, docDate.getDay());
        
        updatedStartDate = new Date(
          updatedStartDate.getYear(), 
          updatedStartDate.getMonth(),
          updatedStartDate.getDate(),
          timeFrame.start.hours, 
          timeFrame.start.minutes);
        
        var updatedEndDate = new Date(
          updatedStartDate.getYear(), 
          updatedStartDate.getMonth(),
          updatedStartDate.getDate(),
          timeFrame.end.hours, 
          timeFrame.end.minutes);
        
        // Find the last date on this day before it should finish
        
        var presentFinishDate = new Date(currentYear, endMonth, endDayOfMonth);
        
        var GO_BACKWARDS = true;
        var updatedFinishDate = getDateOnThisDay_(presentFinishDate, docDate.getDay(), GO_BACKWARDS);
        
        updatedFinishDate = new Date(
          updatedFinishDate.getYear(), 
          updatedFinishDate.getMonth(),
          updatedFinishDate.getDate());
        
        dates = {
          'start':  updatedStartDate,
          'end':    updatedEndDate,
          'finish': updatedFinishDate
        };
        
      }
    }

    // Look for "[number][ST|ND|RD|TH] [day of the week] OF THE MONTH", e.g. "1ST SUNDAY OF THE MONTH". 
    finds = note.match(/^(([1-4]{1})(ST|ND|RD|TH))\s(SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)\sOF\sTHE\sMONTH/);
    
    if (finds !== null && finds.length === 5) {
      conditions = {
        'queue': Number(finds[2]),
        'day': finds[4]
      };
    } 
    
    Log_.fine('dates: %s', dates);
    Log_.fine('conditions: %s', conditions);
    
    return [dates, conditions];
    
  } // exportEvents_.processHeading6()
      
} // exportEvents_()