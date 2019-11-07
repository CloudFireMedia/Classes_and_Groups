// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// Code review all files - TODO
// JSHint review (see files) - TODO
// Unit Tests - TODO
// System Test (Dev) - TODO
// System Test (Prod) - TODO

// Config.gs
// =========
//
// All the constants and configuration settings

var SCRIPT_NAME = 'ClassesAndGroups';
var SCRIPT_VERSION = 'v1.6.dev_ajr';

var PRODUCTION_VERSION_ = false

// Log Library
// -----------

var DEBUG_LOG_LEVEL_ = PRODUCTION_VERSION_ ? BBLog.Level.INFO : BBLog.Level.FINER
var DEBUG_LOG_DISPLAY_FUNCTION_NAMES_ = PRODUCTION_VERSION_ ? BBLog.DisplayFunctionNames.NO : BBLog.DisplayFunctionNames.YES

// Assert library
// --------------

var SEND_ERROR_EMAIL_ = PRODUCTION_VERSION_ ? true : false
var HANDLE_ERROR_ = Assert.HandleError.THROW
var ADMIN_EMAIL_ADDRESS_ = ''

// Tests
// -----

var PRODUCTION_VERSION = false

var TEST_DOC_ID_ = '1EGihPHopDF9qedSz_AD2TpbcR92RpcGOp94r3Y2eGTw'; 

var TEST_USE_UI_URL_ = true
var TEST_SIGNAGE_SHEET_URL_ = 'https://docs.google.com/spreadsheets/d/1qVZDPBynzOzSgWJj_LW1vrp98kHnEweA0Cp2ICMAZbk/edit#gid=0';

if (PRODUCTION_VERSION) {
  if (!TEST_USE_UI_URL_) {
    throw new Error('Test flag set in production version');
  }
}

// Constants/Enums
// ===============

var USER_GUIDE_LINK_ = 'https://docs.google.com/document/d/1ZXifx5WSlNoxPku7Cn8zZALKIDVjFk1NxwvvFDbth8s/edit#heading=h.9qlsam9808zt';

var DOWNLOAD_URL_ = 'https://script.google.com/macros/s/AKfycbwVM_JC2j5XDxVS9Z7Ghjw0yxFisD4iTme9GLUGHS6FpCecmHI/exec';

// TODO - CCN Specific - https://trello.com/c/715exf5P
var CONTACT_NAME_ = 'Greg Brewer';
var CONTACT_EMAIL_ = 'greg.brewer@ccnash.org';

var MONTHS_ = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER'
];

var DAYS_OF_WEEK_ = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
];

var NUMBER_OF_MS_IN_A_DAY_ = 1000 * 60 * 60 * 24;

// Function Template
// -----------------

/**
 *
 *
 * @param {object} 
 *
 * @return {object}
 */
/* 
function functionTemplate() {
  Log_.functionEntryPoint()
  
  
} // functionTemplate() 
*/
