// JSHint - 20200108
/* jshint asi: true */

(function() {"use strict"})()

// ClassesAndGroups.gs
// ===================
//
// External interface to this script - all of the event handlers.
//
// This files contains all of the event handlers, plus miscellaneous functions 
// not worthy of their own files yet
//
// The filename is prepended with _API as the Github chrome extension won't 
// push a file with the same name as the project.

var Log_

// Public event handlers
// ---------------------
//
// All external event handlers need to be top-level function calls; they can't 
// be part of an object, and to ensure they are all processed similarily 
// for things like logging and error handling, they all go through 
// errorHandler_(). These can be called from custom menus, web apps, 
// triggers, etc
// 
// The main functionality of a call is in a function with the same name but 
// post-fixed with an underscore (to indicate it is private to the script)
//
// For debug, rather than production builds, lower level functions are exposed
// in the menu

var EVENT_HANDLERS_ = {

//                           Name                            onError Message                          Main Functionality
//                           ----                            ---------------                          ------------------

  formatDoc:                 ['formatDoc()',                 'Failed to format doc',                  formatDoc_],
  showDeletePopup:           ['showDeletePopup()',           'Failed to show delete popup',           showDeletePopup_],
  showExportPopup:           ['showExportPopup()',           'Failed to show export popup',           showExportPopup_],
  chooseSettingsFile:        ['chooseSettingsFile()',        'Failed to choose settings file',        chooseSettingsFile_],
  setTrigger:                ['setTrigger()',                'Failed to set trigger',                 setTrigger_],
  changeFilename:            ['changeFilename()',            'Failed to changeFilename',              changeFilename_],
  deleteEvents:              ['deleteEvents()',              'Failed to delete events',               deleteEvents_],
  exportEvents:              ['exportEvents()',              'Failed to export events',               exportEvents_],
  doGet:                     ['doGet()',                     'Failed to process GET',                 doGet_],
  showInstructions:          ['showInstructions()',          'Failed to show instructions',           showInstructions_],
}

function showInstructions()   {eventHandler_(EVENT_HANDLERS_.showInstructions)}
function formatDoc()          {eventHandler_(EVENT_HANDLERS_.formatDoc)}
function showDeletePopup()    {eventHandler_(EVENT_HANDLERS_.showDeletePopup)}
function showExportPopup()    {eventHandler_(EVENT_HANDLERS_.showExportPopup)}
function chooseSettingsFile() {eventHandler_(EVENT_HANDLERS_.chooseSettingsFile)}
function setTrigger()         {eventHandler_(EVENT_HANDLERS_.setTrigger)}

// Triggers
function changeFilename() {eventHandler_(EVENT_HANDLERS_.changeFilename)}

// Client-side 
function deleteEvents(calendarsNames) {eventHandler_(EVENT_HANDLERS_.deleteEvents, calendarsNames)}
function exportEvents(settings)       {return eventHandler_(EVENT_HANDLERS_.exportEvents, settings)}

// Web App
function doGet(event) {return eventHandler_(EVENT_HANDLERS_.doGet_(event))}

// Private Functions
// =================

// General
// -------

/**
 * All external function calls should call this to ensure standard 
 * processing - logging, errors, etc - is always done.
 *
 * @param {Array} config:
 *   [0] {Function} prefunction
 *   [1] {String} eventName
 *   [2] {String} onErrorMessage
 *   [3] {Function} mainFunction
 *
 * @param {Object}   args       The argument passed to the top-level event handler
 */

function eventHandler_(config, args) {

  try {

    var auth = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationStatus()
    
    if (auth === ScriptApp.AuthorizationStatus.NOT_REQUIRED) {
    
      var logSheetId = Config.get('CLASSES_AND_GROUPS_LOG_ID')
  
      Log_ = BBLog.getLog({
        level:                DEBUG_LOG_LEVEL_, 
        displayFunctionNames: DEBUG_LOG_DISPLAY_FUNCTION_NAMES_,
        sheetId:              logSheetId,
      })

      var userEmail = Session.getActiveUser().getEmail()

      Log_.info('Handling ' + config[0] + ' from ' + (userEmail || 'unknown email') + ' (' + SCRIPT_NAME + ' ' + SCRIPT_VERSION + ')')    
    }
    
    // Call the main function
    return config[2](args)
    
  } catch (error) {
  
    var handleError = Assert.HandleError.DISPLAY_FULL

    if (!PRODUCTION_VERSION_) {
      handleError = Assert.HandleError.THROW
    }

    var assertConfig = {
      error:          error,
      userMessage:    config[1],
      log:            Log_,
      handleError:    handleError, 
      sendErrorEmail: SEND_ERROR_EMAIL_, 
      emailAddress:   ADMIN_EMAIL_ADDRESS_,
      scriptName:     SCRIPT_NAME,
      scriptVersion:  SCRIPT_VERSION, 
    }

    Assert.handleError(assertConfig) 
  }
  
} // eventHandler_()

// Private event handlers
// ----------------------

// Web App

function doGet_(event) {
  console.log(event.parameter);
  var id = event.parameter.id;
  var file = DriveApp.getFileById(id);
  var fileString = file.getBlob().getDataAsString();
  var fileName = file.getName();
  var output = ContentService.createTextOutput(fileString);
  return output.downloadAsFile(fileName);
}

function showInstructions_() {
  openWindow_(USER_GUIDE_LINK_, 'Opening CloudFire User Guide - Classes And Groups'); 
}