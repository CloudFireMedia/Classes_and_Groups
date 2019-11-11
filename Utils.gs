
function getDateTimeFromDocTitle_(title) {
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
  Log_.info('Got date ' + date + ' from doc title');
  return date;
}

function alert_(title, prompt) {
  var ui = Utils.getUi();
  
  if (ui !== null) {
    ui.alert(title, prompt, ui.ButtonSet.OK);
  }
  
  Log_.info(prompt);
}

function openWindow_(url, text) {
  var js = 
      "<script>" +
      "window.open('" + url + "'); " +
      "google.script.host.close(); " +
      "</script>";
          
  var html = HtmlService.createHtmlOutput(js)
    .setHeight(10)
    .setWidth(100);
          
  DocumentApp.getUi().showModalDialog(html, text);
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

/**
 * If the original date in the script is not the required day of the week, the 
 * look backwards or forwards in time.
 *
 * @param {Date} originalDate
 * @param {string || number} dayOfTheWeek
 * @param {boolean} forwards [OPTIONAL, DEFAULT true]
 *
 * @return {Date} new date
 */

function getDateOnThisDay_(originalDate, dayOfTheWeek, forwards) {

  if (forwards === undefined) {
    forwards = true;
  }
  
  // Assume it is a number
  var dayOfTheWeekIndex = dayOfTheWeek;
  
  if (typeof dayOfTheWeek === 'string') {
  
    dayOfTheWeekIndex = DAYS_OF_WEEK_
      .indexOf(
       dayOfTheWeek.trim().toUpperCase())
  }
  
  var nextDate = originalDate;
  var nextDay = nextDate.getDay();
  var offset = 0;
  
  while (nextDay !== dayOfTheWeekIndex) {
  
    forwards ? offset++ : offset--;
    
    nextDate = new Date(
      originalDate.getYear(), 
      originalDate.getMonth(), 
      originalDate.getDate() + offset);
           
    nextDay = nextDate.getDay();
  }
  
  Log_.fine('nextDate: ' + nextDate);
  return nextDate;
  
} // getDateOnThisDay_()

function getDateInMs_(date) {
  return new Date(date.getYear(), date.getMonth(), date.getDate()).getTime()
}