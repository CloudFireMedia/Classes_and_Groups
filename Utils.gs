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

function getDateTimeFromDocTitle_(title) {
  var logSheet = logInit_();
  
  var dateInTitleArray = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);
  
  if (dateInTitleArray === null || dateInTitleArray.length !== 4) {
    return null
  }
  
  var year = parseInt(dateInTitleArray[1], 10);
  var month = parseInt(dateInTitleArray[2], 10);
  var day = parseInt(dateInTitleArray[3], 10);
  
  // Check for NaN
  if (year !== year || month !== month || day !== day) {
    throw new Error('Bad date in "' + title + '"');
  }
  
  var date = new Date(year, month - 1, day); 
  log_(logSheet, 'Got date ' + date + ' from doc title')
  return date
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
  var ui = getUi_();
  
  if (ui !== null) {
    ui.alert(title, prompt, ui.ButtonSet.OK);
  }
  
  log_(logSheet, prompt);
}

/* To Title Case © 2018 David Gouch | https://github.com/gouch/to-title-case */

// eslint-disable-next-line no-extend-native
function toTitleCase_(title) {
  'use strict'
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i
  var alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/
  var wordSeparators = /([ :–—-])/

  return title.split(wordSeparators)
    .map(function (current, index, array) {
      if (
        /* Check for small words */
        current.search(smallWords) > -1 &&
        /* Skip first and last word */
        index !== 0 &&
        index !== array.length - 1 &&
        /* Ignore title end and subtitle start */
        array[index - 3] !== ':' &&
        array[index + 1] !== ':' &&
        /* Ignore small words that start a hyphenated phrase */
        (array[index + 1] !== '-' ||
          (array[index - 1] === '-' && array[index + 1] === '-'))
      ) {
        return current.toLowerCase()
      }

      /* Ignore intentional capitalization */
      if (current.substr(1).search(/[A-Z]|\../) > -1) {
        return current
      }

      /* Ignore URLs */
      if (array[index + 1] === ':' && array[index + 2] !== '') {
        return current
      }

      /* Capitalize the first letter */
      return current.replace(alphanumericPattern, function (match) {
        return match.toUpperCase()
      })
    })
    .join('')
}

function toSentenceCase_(sentence) {
  if (sentence === undefined || sentence === '') {
    return '';
  }
  var toSentenceCase = sentence[0].toUpperCase() + sentence.slice(1);
  if (sentence[sentence.length] !== '.') {
    toSentenceCase += '.';
  }
  return toSentenceCase;
}

function openWindow_(url) {
  var js = 
      "<script>" +
      "window.open('" + url + "'); " +
      "google.script.host.close(); " +
      "</script>"
          
  var html = HtmlService.createHtmlOutput(js)
    .setHeight(10)
    .setWidth(100)
          
  DocumentApp.getUi().showModalDialog(html, 'Downloading file, please wait....')
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
