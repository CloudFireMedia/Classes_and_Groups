function onOpen(e) {
	var ui = DocumentApp.getUi();

	ui.createMenu('Automation')
		.addItem('Read Instructions', 'instructionsDialogueBox') 
		.addItem('Format Text', 'myFunction')
		.addSeparator()
		.addSubMenu(
			ui.createMenu('Update Promotion Material')
				.addItem('Delete Future Calendar Events', 'ShowDeletePopup')
				.addItem('Push Events to Google Calendar', 'ShowExportPopup')
				.addItem('Download .json for INDD Classrooms Signage', 'ChooseSettingsFile')
		)
		.addToUi();
}