function SetTrigger() {
	var doc = DocumentApp.getActiveDocument(),
		title = doc.getName(),
		res = title.match(/\[\s*(\d+)\.(\d+)\.(\d+)\s*\]/);

	if (res.length == 4) {
		var year = parseInt(res[1], 10),
			month = parseInt(res[2], 10),
			day = parseInt(res[3], 10);

		AddTrigger(year, month, day);
	}
}

function AddTrigger(year, month, day) {
	ScriptApp.newTrigger('ChangeFilename')
			 .timeBased()
			 .atDate(year, month, day)
			 .create();
}

function ChangeFilename() {
	var ss = SpreadsheetApp.openById('1d0-hBf96ilIpAO67LR86leEq09jYP2866uWC48bJloc'),
		sheet = ss.getSheetByName('Communications Director Master'),
		ranges = sheet.getRangeList(['D4:D', 'E4:E']).getRanges(),
		dates = ranges[0].getValues(),
		titles = ranges[1].getValues();

	for (var i = 0; i < titles.length; i++) {
		var title = String(titles[i][0]).trim(),
			date = dates[i][0];

        if (title == 'Christ Church Communities (C3) Fall Classes and Groups') {
            var doc = DocumentApp.openById('1IERhnXTjuLF47if9kwvPja00ETBsgBmrcHHZSNdoyHo'),
				year = date.getFullYear(),
				month = date.getMonth() + 1,
				fullMonth = (month < 10) ? ('0' + month) : month,
				day = date.getDate(),
				fullDay = (day < 10) ? ('0' + day ) : day;

			doc.setName('[ '+ year +'.'+ fullMonth +'.'+ fullDay +' ] Classes and Groups');

			AddTrigger(year, month, day);
		}
	}
}