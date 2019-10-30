// jshint 28Oct2019

function chooseSettingsFile_() {
  var ui = DocumentApp.getUi();
  
  var result = ui.prompt(
        'Enter Settings file URL',
          'Please enter the URL of settings file, or leave blank for ' + 
          '1 copy for each location. Tab must be named "Classroom Signage Quantities"',
        ui.ButtonSet.OK_CANCEL
      );
      
  var button = result.getSelectedButton();
  
  if (button !== ui.Button.OK) {
    return;
  }

  var url = result.getResponseText().trim();
  var settings = {};

  try {
  
    if (url !== '') { 
      
      // Get the quantities for each room from the settings file      
      var spreadsheet = SpreadsheetApp.openByUrl(url);
      var sheet = spreadsheet.getSheetByName('Classroom Signage Quantities');
      var range = sheet.getDataRange();
      var values = range.getValues();
      
      for (var i = 1; i < values.length; i++) {
        var location = (typeof(values[i][0]) === 'number') ? 'Room ' + values[i][0] : values[i][0].trim();
        var copies = values[i][1];        
        settings[location] = copies;
      }
    }
    
    ConvertToJson(settings);
    
  } catch (error) {
    ui.alert(error.message);
  }
    
  return;
  
  // Private Functions
  // -----------------
  
  function ConvertToJson(settings) {
  
    var app = DocumentApp;
    var doc = app.getActiveDocument();
    var body = doc.getBody();
    var paragraphs = body.getParagraphs();
    var filename = doc.getName().split('.')[0].slice(2) + '.json'; // Expecting "[ YYYYY.MM.dd ] ...";
    var data = {};
    var result = {};
    var day;
    var time;
    var location;
    var title;
    var room;
    
    if (settings === null) {
      settings = {};
    }
    
    for (var i=0; i < paragraphs.length; i++) {
      var paragraph = paragraphs[i];
      var text = paragraph.getText().trim();
      var heading = paragraph.getHeading();
      
      if (text.toUpperCase() === 'OTHER EVENTS') {
        break;
      }
      
      switch (heading) {
          // day of the week
        case DocumentApp.ParagraphHeading.HEADING1: {
          day = text;          
          break;
        }
          // time
        case DocumentApp.ParagraphHeading.HEADING2: {
          time = text;          
          break;
        }
          // title & location
        case DocumentApp.ParagraphHeading.HEADING3: {
          var header = text.split('|');
          
          if (header.length > 1) {
            switch (header.length) {
              case 2: {
                title = header[0].trim();
                location = header[1].trim();                
                break;
              }
              case 3: {
                title = header[0].trim();
                location = header[2].trim();
                break;
              }
            }
            
            if (!data.hasOwnProperty(location)) {
              data[location] = {
                'events': {},
                'copies': 1
              };
              
              for (room in settings) {
                if (location.toUpperCase() === room.toUpperCase()) {
                  data[location].copies = settings[room];
                }
              }
            }
            
            if (!data[location].events.hasOwnProperty(day)) {
              data[location].events[day] = [];
            }
            
            data[location].events[day].push({
              'title': title,
              'time': time
            });
          }
          
          break;
        }
          // description
        case DocumentApp.ParagraphHeading.HEADING4: {          
          break;
        }
      }
    }
    
    for (room in settings) {
    
      if (!settings.hasOwnProperty(room)) {
        continue;
      }
    
      for (location in data) {
      
        if (!data.hasOwnProperty(location)) {
          continue;
        }
      
        if (room.toUpperCase() == location.toUpperCase()) {
          result[location] = data[location];
        }
      }
    }
    
    if (Object.keys(settings).length === 0) {
      for (location in data) {
      
        if (!data.hasOwnProperty(location)) {
          continue;
        }
        
        result[location] = data[location];
      }
    }

    var DOWNLOAD_URL_ = 'https://script.google.com/macros/s/AKfycbwVM_JC2j5XDxVS9Z7Ghjw0yxFisD4iTme9GLUGHS6FpCecmHI/exec';

    var content = JSON.stringify(result);
    var file = DriveApp.createFile(filename, content, MimeType.JAVASCRIPT);
    
    openWindow_(DOWNLOAD_URL_ + '?id=' + file.getId());
    
  } // chooseSettingsFile_.ConvertToJson()

} //chooseSettingsFile_()