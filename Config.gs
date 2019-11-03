var SCRIPT_NAME = 'ClassesAndGroups';
var SCRIPT_VERSION = 'v1.6.dev_ajr';

// Tests
// -----

var PRODUCTION_VERSION = true

var TEST_DOC_ID_ = '1TJOotfl6Ifdx1I_f_oUQm2NJ06SXRkRYlJlT_LQ1vHY'; 

var TEST_USE_UI_URL_ = true
var TEST_SIGNAGE_SHEET_URL_ = 'https://docs.google.com/spreadsheets/d/1qVZDPBynzOzSgWJj_LW1vrp98kHnEweA0Cp2ICMAZbk/edit#gid=0';

if (PRODUCTION_VERSION) {
  if (!TEST_USE_UI_URL_) {
    throw new Error('Test flag set in production version');
  }
}

// Enums and constants
// -------------------

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