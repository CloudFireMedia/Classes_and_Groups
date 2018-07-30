function onOpen(e) {
  DocumentApp.getUi().createMenu("[ Automation ]")  
   .addItem("Read Instructions", "instructionsDialogueBox") 
   .addItem("Format Text", "myFunction")

 .addSeparator()
 .addSubMenu(
    DocumentApp.getUi().createMenu('Update Promotion Material')
   .addItem("Delete Future Calendar Events", "DeleteEvents")
   .addItem("Push Events to Google Calendar", "ParseEvents")
   .addItem("Download .json for INDD Classrooms Signage", "ChooseSettingsFile")
)

 .addToUi();
 
}
