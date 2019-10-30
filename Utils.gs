function getDateTimeFromDocTitle_(title) {
  var logSheet = logInit_();
  
  var dateInTitleArray = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);
  
  if (dateInTitleArray === null || dateInTitleArray.length !== 4) {
    return null;
  }
  
  var year = parseInt(dateInTitleArray[1], 10);
  var month = parseInt(dateInTitleArray[2], 10);
  var day = parseInt(dateInTitleArray[3], 10);
  
  // Check for NaN
  if (year !== year || month !== month || day !== day) {
    throw new Error('Bad date in "' + title + '"');
  }
  
  var date = new Date(year, month - 1, day); 
  log_(logSheet, 'Got date ' + date + ' from doc title');
  return date;
}

function logInit_() {
  var logSheetId = Config.get('CLASSES_AND_GROUPS_LOG_ID');
  return SpreadsheetApp.openById(logSheetId).getSheetByName('Log');
}

function log_(logSheet, message) {
  logSheet.appendRow([new Date(), message]);
}

function alert_(title, prompt) {
  var logSheet = logInit_();  
  var ui = Utils.getUi();
  
  if (ui !== null) {
    ui.alert(title, prompt, ui.ButtonSet.OK);
  }
  
  log_(logSheet, prompt);
}

function openWindow_(url) {
  var js = 
      "<script>" +
      "window.open('" + url + "'); " +
      "google.script.host.close(); " +
      "</script>";
          
  var html = HtmlService.createHtmlOutput(js)
    .setHeight(10)
    .setWidth(100);
          
  DocumentApp.getUi().showModalDialog(html, 'Downloading file, please wait....');
} 

function to24Hours_(hours, period) {
  if (period == 'AM' && hours == 12) {
    hours = 0;
  } else if (period == 'PM' && hours < 12) {
    hours = hours + 12;
  }
  return hours;
  
} // to24Hours_()

function isInArray_(arr, obj) {
  for (var i = 0; i < arr.length; i++) {
    if (+arr[i] === +obj) {
      return true;
    }
  }  
  return false;
  
} // isInArray_()
