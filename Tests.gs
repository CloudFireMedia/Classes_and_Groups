var TEST_DOC_ID_ = '12XwMZoQkukFdZKzGYZIOHW7U5F9dieFe0g-1PtxwyKY'

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

function test_ExportEvents() {
  var settings = {
    populate_days:           ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], 
    new_events_calendar:     "andrew@cloudfire.media", 
    regular_events_calendar: "andrew@cloudfire.media"
  }

  ExportEvents_(settings)
}

function test_formatDoc() {
  formatDoc_()
  return
}
