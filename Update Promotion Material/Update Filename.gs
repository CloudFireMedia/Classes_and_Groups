function SetTrigger_() {
  var doc = getDoc_(),
      title = doc.getName(),
      res = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);
  
  if (res.length == 4) {
    var year = parseInt(res[1], 10),
        month = parseInt(res[2], 10),
        day = parseInt(res[3], 10);
    
    AddTrigger(year, month, day);
  }
  
  return;
  
  // Private Functions
  // -----------------
  
  function AddTrigger(year, month, day) {
    ScriptApp.newTrigger('ChangeFilename')
      .timeBased()
      .atDate(year, month, day)
      .create();
  }
  
} // SetTrigger_()


function ChangeFilename() {
  var ss = SpreadsheetApp.openById(Config.get('PROMOTION_DEADLINES_CALENDAR_SPREADSHEET_ID')),
      sheet = ss.getSheetByName(Config.get('EVENTS_DATA_SHEET_NAME')),
      ranges = sheet.getRangeList(['D4:D', 'E4:E']).getRanges(),
      dates = ranges[0].getValues(),
      titles = ranges[1].getValues();
  
  for (var i = 0; i < titles.length; i++) {
    var title = String(titles[i][0]).trim(),
        date = dates[i][0];
    
    if (title == Config.get('CLASSES_AND_GROUPS_DEADLINE_EVENT_NAME')) {
      var doc = DocumentApp.openById(Config.get('CLASSES_AND_GROUPS_DOCUMENT_ID')),
          year = date.getFullYear(),
          month = date.getMonth() + 1,
          fullMonth = (month < 10) ? ('0' + month) : month,
          day = date.getDate(),
          fullDay = (day < 10) ? ('0' + day ) : day;
      
      doc.setName('[ '+ year +'.'+ fullMonth +'.'+ fullDay +' ] Classes and Groups');
      
      AddTrigger(year, month, day);
    }
  }
}