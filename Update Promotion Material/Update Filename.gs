/**
 * Create a trigger to update the C&G filename to run at the date 
 * in the doc title
 */

function setTrigger_() {
  var doc = getDoc_();
  var title = doc.getName();
  var date = getDateTimeFromDocTitle_(title);
    
  if (date === null) {  
    alert_('Failed to create trigger', 'No date in doc title "' + title + '"')
    return;
  }  

  createChangeFilenameTrigger_(
    date.getYear(), 
    date.getMonth() + 1, 
    date.getDate());
  
} // setTrigger_()

/**
 * Update the filename and re-start the trigger
 *
 * '[date] Christ Church Communities (C3) [season] Classes + Groups_Booklet'
 */

function changeFilename_() {
  var logSheet = logInit_()
  var doc = DocumentApp.openById(Config.get('CLASSES_AND_GROUPS_DOCUMENT_ID'));
  var docTitle = doc.getName();
  var dateOnPresentDoc = getDateTimeFromDocTitle_(docTitle);
  
  var ss = SpreadsheetApp.openById(Config.get('PROMOTION_DEADLINES_CALENDAR_ID'));
  var sheet = ss.getSheetByName('Communications Director Master');
  var ranges = sheet.getRangeList(['D4:D', 'E4:E']).getRanges();
  var dates = ranges[0].getValues();
  var titles = ranges[1].getValues();
  
  var id;
  
  var foundNewDoc = false
  
  for (var i = 0; i < titles.length; i++) {
  
    var title = String(titles[i][0]).trim();
    var date = dates[i][0];
    
    // Look at future date for the new C&G GDoc
    
    if (date > dateOnPresentDoc && 
        title.indexOf('Christ Church Communities (C3)') !== -1 && 
        title.indexOf('Classes + Groups') !== -1) {
      var doc = DocumentApp.openById(Config.get('CLASSES_AND_GROUPS_DOCUMENT_ID'));      
      var timeZone = Session.getScriptTimeZone();
      var dateTitle = Utilities.formatDate(date, timeZone, '[ yyyy.MM.dd ]');
      
      // [ 2020.01.05 ] Christ Church Communities (C3) Winter Classes + Groups_Booklet
      
      var title = 
        dateTitle + ' ' + 
        'Christ Church Communities (C3) ' + 
        getSeason(date.getMonth()) + ' ' + // zero-index
        'Classes + Groups_Booklet'
      
      doc.setName(title);
      log_(logSheet, 'Renamed GDoc to "' + title + '"');
      
      createChangeFilenameTrigger_(
        date.getYear(), 
        date.getMonth() + 1, 
        date.getDate());
        
      foundNewDoc = true;
    }
    
  } // for each row in PDC
  
  if (!foundNewDoc) {  
  
    // Look again tomorrow
    var today = new Date();
    
    createChangeFilenameTrigger_(
      today.getYear(), 
      today.getMonth() + 1, 
      today.getDate() + 1);
  }
  
  return
  
  // Private Functions
  // -----------------
  
  function getSeason(month) {
    var season
    
    if (month === 11) {
      season = 'Winter';
    } else if (month >= 0 && month < 2) {
      season = 'Winter';     
    } else if (month >= 2 && month < 5) {
      season = 'Spring';
    } else if (month >= 5 && month < 8) {
      season = 'Summer';
    } else if (month >= 8 && month < 11) {
      season = 'Fall';
    } else {
      throw new Error('Invalid month')
    }

    return season;
  }
  
} // changeFilename_()

function createChangeFilenameTrigger_(year, month, dayOfMonth) {

  var logSheet = logInit_();
  log_(logSheet, year + '-' + month + '-' + dayOfMonth)

  deleteExistingChangeFilenameTriggers_()  ;  
 
  // Create a new one
  var id = ScriptApp.newTrigger('changeFilename')
    .timeBased()
    .atDate(year, month, dayOfMonth)
    .create()
    .getUniqueId();
  
  var triggerDate = new Date(year, month - 1, dayOfMonth);
    
  alert_(
    'Created new trigger', 
    'New "changeFilename()" trigger ' + id + ' set for ' + triggerDate);
    
  // Private Functions
  // -----------------
  
  function deleteExistingChangeFilenameTriggers_() {  
    var logSheet = logInit_()
    ScriptApp.getProjectTriggers().forEach(function(trigger) {
      if (trigger.getHandlerFunction() === 'changeFilename') {
        var id = trigger.getUniqueId()
        ScriptApp.deleteTrigger(trigger)
        log_(logSheet, 'Deleted "changeFilename()" trigger ' + id);
      }
    }) 
    
  } // createChangeFilenameTrigger_.deleteExistingChangeFilenameTriggers_()
  
} // createChangeFilenameTrigger_()
