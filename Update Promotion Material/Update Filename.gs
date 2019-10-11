/**
 * Create a trigger to update the C&B filename to run at the date 
 * in the doc title
 */

function setTrigger_() {

  var logSheet = logInit()
  var doc = getDoc_();
  var title = doc.getName();
  date = getDateTimeFromDocTitle(title);
    
  if (date === null) {
    log(logSheet,'Failed to find date in "' + title + '"');
    return;
  }  
    
  ScriptApp.newTrigger('changeFilename')
    .timeBased()
    .atDate(date.getYear(), date.getMonth() + 1, date.getDate())
    .create();
  
  log(logSheet, 'Started new "changeFilename()" trigger for "' + title + '"');
  
} // setTrigger_()

/**
 * Update the filename and re-start the trigger
 *
 * '[date] Christ Church Communities (C3) [season] Classes + Groups_Booklet'
 */

function changeFilename_() {

  var doc = DocumentApp.openById(Config.get('CLASSES_AND_GROUPS_DOCUMENT_ID'))
  var docTitle = doc.getName()
  var dateOnPresentDoc = getDateTimeFromDocTitle(title);
  
  var ss = SpreadsheetApp.openById(Config.get('PROMOTION_DEADLINES_CALENDAR_SPREADSHEET_ID'));
  var sheet = ss.getSheetByName('Communications Director Master');
  var ranges = sheet.getRangeList(['D4:D', 'E4:E']).getRanges();
  var dates = ranges[0].getValues();
  var titles = ranges[1].getValues();
  
  var foundNewDoc = false
  
  for (var i = 0; i < titles.length; i++) {
  
    var title = String(titles[i][0]).trim();
    var date = dates[i][0];
    
    // Look at future date for the new C&G GDoc
    
    if (date > dateOnPresentDoc && 
        title.indexOf('Christ Church Communities') !== -1 && 
        title.indexOf('Classes + Groups') !== -1) {
      var doc = DocumentApp.openById(Config.get('CLASSES_AND_GROUPS_DOCUMENT_ID'));      
      var timeZone = Session.getScriptTimeZone()
      var dateTitle = Utilities.formatDate(date, timeZone, '[ yyyy.MM.dd ]')
      doc.setName(title);
      
      // Delete the daily trigger
      ScriptApp.getProjectTriggers().forEach(function(trigger) {
        if (trigger.getHandlerFunction() === 'changeFilename') {
          var id = trigger.getUniqueId()
          ScriptApp.deleteTrigger(trigger)
          log(logSheet, 'Deleted daily "changeFilename()" trigger ' + id);
        }
      })
      
      // Set a trigger for when this doc expires
      var trigger = ScriptApp.newTrigger('changeFilename')
        .timeBased()
        .atDate(date.getYear(), date.getMonth() + 1, date.getDate())
        .create();

      var id = trigger.getUniqueId()
      log(logSheet, 'Created new "changeFilename()" trigger ' + id + ' for ' + date);
      foundNewDoc = true;
    }
    
  } // for each row in PDC
  
  if (!foundNewDoc) {
  
    // Look again tomorrow
    
    var today = new Date()
    var tomorrow = new Date(today.getYear(), today.getMonth(), today.getDate() + 1)
    
    ScriptApp.newTrigger('changeFilename')
      .timeBased()
      .atDate(tomorrow.getYear(), tomorrow.getMonth() + 1, tomorrow.getDate())
      .create();      
  }
  
} // changeFilename()