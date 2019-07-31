// created by Mikhail K. on freelancer.com

function ChooseSettingsFile_() {
  var app = DocumentApp,
      ui = app.getUi(),
      result = ui.prompt(
        'Do you want to use the settings file?',
        "Please enter url of settings file. Sheet must be named 'Classroom Signage Quantities'",
        ui.ButtonSet.OK_CANCEL
      ),
      button = result.getSelectedButton(),
      url = result.getResponseText().trim();
  
  switch (button) {
    case ui.Button.OK: {
      try {
        var spreadsheet = SpreadsheetApp.openByUrl(url),
            sheet = spreadsheet.getSheetByName('Classroom Signage Quantities'),
            range = sheet.getDataRange(),
            values = range.getValues(),
            settings = {};
        
        for (var i = 1; i < values.length; i++) {
          var location = typeof(values[i][0]) == 'number' ? 'Room ' + values[i][0] : values[i][0].trim(),
            copies = values[i][1];
          
          settings[location] = copies;
        }
        
        ConvertToJson(settings);
      } catch (err) {
        ui.alert(err.message);
      }
      
      break;
    }
    case ui.Button.CANCEL:
    case ui.Button.CLOSE: {
      ConvertToJson();
      
      break;
    }
  }
  
  return;
  
  // Private Functions
  // -----------------
  
  function ConvertToJson(settings) {
  
    var app = DocumentApp,
        ui = app.getUi(),
        doc = app.getActiveDocument(),
        body = doc.getBody(),
        paragraphs = body.getParagraphs(),
        filename = doc.getName().split('.')[0] + '.json',
          data = {},
            result = {},
              day, time, location, title;
    
    if (settings == null) {
      settings = {};
    }
    
    for (var i=0; i < paragraphs.length; i++) {
      var paragraph = paragraphs[i],
          text = paragraph.getText().trim(),
          heading = paragraph.getHeading();
      
      if (text.toUpperCase() == 'OTHER EVENTS') {
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
            
            if (data[location] == null) {
              data[location] = {
                'events': {},
                'copies': 1
              };
              
              for (var room in settings) {
                if (location.toUpperCase() == room.toUpperCase()) {
                  data[location].copies = settings[room];
                }
              }
            }
            
            if (data[location].events[day] == null) {
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
          //
          
          break;
        }
      }
    }
    
    for (var room in settings) {
      for (var location in data) {
        if (room.toUpperCase() == location.toUpperCase()) {
          result[location] = data[location];
        }
      }
    }
    
    if (Object.keys(settings).length == 0) {
      for (var location in data) {
        if (result[location] == null) {
          result[location] = data[location];
        }
      }
    }
    
    var content = JSON.stringify(result),
        file = DriveApp.createFile(filename, content, MimeType.JAVASCRIPT);
    
    ui.alert('File \"' + file.getName() + '\" saved in your google drive.');
  }

} // ConvertToJson()