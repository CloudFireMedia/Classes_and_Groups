function getDoc_() {
  var doc = DocumentApp.getActiveDocument()
  if (doc === null) {
    doc = DocumentApp.openById(TEST_DOC_ID_)
  }
  return doc
}

function getUi_() {
  var doc = DocumentApp.getActiveDocument()
  var ui = null
  if (doc !== null) {
    ui = DocumentApp.getUi();
  }
  return ui
}

function getDateTimeFromDocTitle(title) {
  var dateInTitleArray = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);
  var date
  
  if (dateInTitleArray.length !== 4) {
    return null
  }
  
  var year = parseInt(datetime[1], 10);
  var month = parseInt(datetime[2], 10);
  var day = parseInt(datetime[3], 10);
  
  date = new Date(year, month - 1, day)
    
  return date
}

function logInit() {
  return SpreadsheetApp.openById(LOG_SHEET_ID_).getSheetByName('Log')
}

function log(logSheet, message) {
  logSheet.appendRow([new Date(), message])
}
