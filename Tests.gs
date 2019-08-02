function test_misc() {
  var time = ''
  var finds = time.match(/^([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})\s*[–\-]\s*([0-9]{1,2})\:([0-9]{1,2})([AM|PM]{2})$/);    
  return
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
