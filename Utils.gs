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

function log(message) {
  SpreadsheetApp.openById('1e4_oaaxoXfr2BWByopjzcdDvLPTyiG2GcCMM5H5OHFE').getSheetByName('Log').appendRow([new Date(), message])
}
