//Redevelopment note: change any 'new!' or 'New!' text to 'NEW!' and change font color to red
//Redevelopment note: change any '-' to ' – ' 
//Redevelopment note: remove any double spaces (function should run last)

// Function For Remove Double Spaces ... reference 'doc' not defined ... needs to be fixed
//function doubleSpaceToSingle(doc) {
//  doc = doc || DocumentApp.getActiveDocument();
//  var body = doc.getBody();
//  doc.getBody().replaceText("[ ]{2,}", " "); 
//}

var ui = DocumentApp.getUi(),
	dayArray = [
		'sunday',
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday',
		'sunday'
	],
	documentId = '1cBbJ4qksyeDWfGmci8hxDRL7np3E_0CeUgJD9ss28s4',
	timeString = 'am ',
	timeString1 = 'pm ';

function myFunction() {
	var body = DocumentApp.getActiveDocument().getBody(),
		paras = body.getParagraphs();
	
	for (var i = 0; i < paras.length; i++) {
		//Get First Word Of Paragraph
		var txt = paras[i].getText(),
			para = txt.split(' '),
			otherEvents = (para[0] + ' ' + para[1]).toLowerCase(),
			firstWord = para[0].toLowerCase(),
			patt = new RegExp(/([0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|([1-9]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|(1[0-2]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))/),
			res = patt.test(firstWord),
			//First Condition Check If Word Exist In Day Array... Set Heading 1
			a = dayArray.indexOf(firstWord);
		//ui.alert(para[1]);
		//return;
		if (a != '-1' && para[1] == undefined) {
			//Create Stype For Day Name
			var dayNameStyle = {};

			dayNameStyle[DocumentApp.Attribute.BOLD] = true;
			dayNameStyle[DocumentApp.Attribute.FONT_SIZE] = 30;
			dayNameStyle[DocumentApp.Attribute.ITALIC] = false;
			dayNameStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';

			paras[i].setAttributes(dayNameStyle);
			paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING1);
		} else if (otherEvents == 'other events') {
			//ui.alert(otherEvents);
			//Create Style For Day Name
			var dayNameStyle = {};

			dayNameStyle[DocumentApp.Attribute.BOLD] = true;
			dayNameStyle[DocumentApp.Attribute.FONT_SIZE] = 30;
			dayNameStyle[DocumentApp.Attribute.ITALIC] = false;
			dayNameStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';

			paras[i].setAttributes(dayNameStyle);
			paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING1);
		} else if(res) {
				//Second Check If Word Is Time... Heading 2
				//Create Stype For Day Name
				var timeStyle = {};

				timeStyle[DocumentApp.Attribute.BOLD] = true;
				timeStyle[DocumentApp.Attribute.FONT_SIZE] = 10;
				timeStyle[DocumentApp.Attribute.ITALIC] = true;
				timeStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';

				paras[i].setAttributes(timeStyle);
				paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING2);
		} else {
			//Third Check For heading 3 If string contain |
			var c = txt.indexOf('|');

			if (c != -1) {
				//Create Stype For Day Name
				var head3Style = {};

				head3Style[DocumentApp.Attribute.BOLD] = true;
				head3Style[DocumentApp.Attribute.FONT_SIZE] = 10;
				head3Style[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';

				paras[i].setAttributes(head3Style);
				paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING3);
			} else {
				// Check Heading 4 if a paragraph does not contain ë|í  AND does not begin with '>>' AND the immediate following paragraph does not start with '>>' = Header 4
				//Check If not Begin with >>
				var d = firstWord.indexOf('>>');

				if (d == '-1') {
					var nextI = i + 1;

					if(nextI < paras.length) {
						var nextParaText=paras[nextI].getText(),
							nextParaFirst=nextParaText.split(' '),
							nextParaFirstWord=nextParaFirst[0],
							//Check If next para done not start with >> then heading 4
							e = nextParaFirstWord.indexOf('>>');

						if (e == '-1') {
							var head4Style = {};

							head4Style[DocumentApp.Attribute.BOLD] = false;
							head4Style[DocumentApp.Attribute.FONT_SIZE] = 9.50;
							head4Style[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';

							paras[i].setAttributes(head4Style);
							paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING4);
						} else {
							var head5Style = {};

							head5Style[DocumentApp.Attribute.BOLD] = false;
							head5Style[DocumentApp.Attribute.FONT_SIZE] = 9.50;
							head5Style[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';

							paras[i].setAttributes(head5Style);
							paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING5);
						}
					}
				} else {
					var head6Style = {};

					head6Style[DocumentApp.Attribute.BOLD] = false;
					head6Style[DocumentApp.Attribute.FONT_SIZE] = 9.50;
					head6Style[DocumentApp.Attribute.ITALIC] = true;
					head6Style[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';

					paras[i].setAttributes(head6Style);
					paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING6);
				}
			}
		}
	}

	removeBlankParagraph();
	applyColorToText();
	//doubleSpaceToSingle(doc);
}

//Function For applying red color to "NEW!"
function applyColorToText() {
	var startTag = 'NE',
		endTag = '!',
		body = DocumentApp.getActiveDocument().getBody(),
		para = body.getParagraphs(),
		highlightStyle = {};

	highlightStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#FF0000';

	for (var i = 0; i < para.length; i++) {
		var text = para[i].editAsText().getText(),
			from = para[i].findText(startTag),
			to = para[i].findText(endTag, from);

		if ((to != null && from != null) && (to.getStartOffset() > 0)) {
			para[i].editAsText().setAttributes(from.getStartOffset(), to.getStartOffset(), highlightStyle);
		}
	}
}

// Function For Remove Blank Paragraph
function removeBlankParagraph() {
	var body = DocumentApp.getActiveDocument().getBody(),
		paras = body.getParagraphs();

	for (var i = 0; i < paras.length; i++) {
		if (paras[i].getText() === '') {
			try {
				paras[i].removeFromParent();
			} catch (err) {}
		}
	}
}