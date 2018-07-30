function onOpen(e) {
	var ui = SpreadsheetApp.getUi();

	ui.createMenu('Automation')
		.addItem('Read Instructions', 'instructionsDialogueBox') 
		.addItem('Format Text', 'myFunction')
		.addSeparator()
		.addSubMenu(
			ui.createMenu('Update Promotion Material')
				.addItem('Delete Future Calendar Events', 'DeleteEvents')
				.addItem('Push Events to Google Calendar', 'ParseEvents')
				.addItem('Download .json for INDD Classrooms Signage', 'ChooseSettingsFile')
		)
		.addToUi();
}