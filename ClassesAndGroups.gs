// External API
// ------------

// Menu Items
function formatDoc() 					{formatDoc_();}
function showDeletePopup() 				{showDeletePopup_();}
function showExportPopup() 				{showExportPopup_();}
function chooseSettingsFile() 			{chooseSettingsFile_();}
function setTrigger() 					{setTrigger_();}

// Triggers
function changeFilename()               {changeFilename_();}

// Client-side 
function deleteEvents(calendarsNames) 	{deleteEvents_(calendarsNames);}
function exportEvents(settings) 		{exportEvents_(settings);}

// Web App
function doGet(event){
  var id = event.parameter.id;
  var file = DriveApp.getFileById(id);
  var fileString = file.getBlob().getDataAsString();
  var fileName = file.getName();
  return ContentService.createTextOutput(fileString).downloadAsFile(fileName);
}
