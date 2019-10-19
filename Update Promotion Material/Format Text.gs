function formatDoc_() {

// DocumentApp.getActiveDocument().getBody().getParagraphs()[0].getText().editAsText().setText(text)

  var logSheet = logInit_();

  var body = getDoc_().getBody();
  var paragraphs = body.getParagraphs();
  
  for (var i = 0; i < paragraphs.length; i++) {
  
    var paragraph = paragraphs[i];  
    var txt = paragraph.getText();
    var wordArray = txt.split(' ');
    var firstWord = wordArray[0].toUpperCase();    
    var firstTwoWords = (wordArray[0] + ' ' + wordArray[1]).toUpperCase();
    var isFirstWordDayOfWeek = DAYS_OF_WEEK_.indexOf(firstWord) !== -1; 
    var justASingleWord = (wordArray[1] == undefined)
    var timeRegex = new RegExp(/([0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|([1-9]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|(1[0-2]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))/);
    var isTimeString = timeRegex.test(firstWord);
    var style = {}
    
    var BOLD = true
    var NOT_BOLD = false
    
    var ITALIC = true
    var NOT_ITALIC = false

    if ((justASingleWord && isFirstWordDayOfWeek) || (firstTwoWords === 'OTHER EVENTS')) {

      // Day of week or "Other Events" title
      setStyle(BOLD, 30, NOT_ITALIC, 'Lato', 'HEADING1');
           
    } else if (isTimeString) {

      setStyle(BOLD, 10, ITALIC, 'Lato', 'HEADING2');

    } else {
    
      if (txt.indexOf('|') !== -1) {
      
        // Event title
        setStyle(BOLD, 10, NOT_ITALIC, 'Lato', 'HEADING3');        
        var toTitleCase = toTitleCase_(txt);
        paragraph.editAsText().setText(toTitleCase);
      
      } else {
      
        var nextI = i + 1;

        if ((firstWord.indexOf('>>') === -1) && (nextI < paragraphs.length)) {
        
          // This paragraph does not begin with '>>' and there is one after that
          
          var nextParaText = paragraphs[nextI].getText();          
          var nextParaWords = nextParaText.split(' ');
          var nextParaFirstWord = nextParaWords[0];
          
          if (nextParaFirstWord.indexOf('>>') === -1) {
          
            // Neither this or the next paragraph start with '>>', 
            // so event description where event details DO NOT follow in the next line

            setStyle(NOT_BOLD, 9.5, NOT_ITALIC, 'Lato', 'HEADING4')
            
          } else {

            // This paragraph does not start with '>>', but the next one does  
            // so event description where event details DO  follow in the next line

            setStyle(NOT_BOLD, 9.5, NOT_ITALIC, 'Lato', 'HEADING5')
          }
          
          var toSentenceCase = toSentenceCase_(txt);
          paragraph.editAsText().setText(toSentenceCase);
                    
        } else { // Starts with '>>'

          setStyle(NOT_BOLD, 9.5, ITALIC, 'Lato', 'HEADING6')
        }
      }
    }
    
  } // for each paragraph
  
  removeBlankParagraph();
  applyColorToText();
  doubleSpaceToSingle();
  updateDashes();
  
  return;
  
  // Private Functions
  // -----------------

  function setStyle(bold, fontSize, italic, fontStyle, heading) {
  
    var style = {};
    style[DocumentApp.Attribute.BOLD] = bold;
    style[DocumentApp.Attribute.FONT_SIZE] = fontSize;
    style[DocumentApp.Attribute.ITALIC] = italic;
    style[DocumentApp.Attribute.FONT_FAMILY] = fontStyle;
      
    paragraph.setAttributes(style);
    paragraph.setHeading(DocumentApp.ParagraphHeading[heading]);
  }

  function doubleSpaceToSingle() {
    body.replaceText("[ ]{2,}", " "); 
  }
  
  function removeBlankParagraph() {
    var paragraphs = body.getParagraphs();
    var numberOfParagraphs = paragraphs.length
    for (var i = 0; i < numberOfParagraphs; i++) {
      if (paragraphs[i].getText() === '') {
        if (i < (numberOfParagraphs - 1)) {
          paragraphs[i].removeFromParent();
        }
      }
    }
  }  

  // Apply red color to "NEW! or "New!", or any variation of case
  function applyColorToText() {
    var endTag = '!';
    var para = body.getParagraphs();
    var highlightStyle = {}; 
    highlightStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#FF0000';
    
    highlightText('NEW');
    highlightText('New');
    highlightText('new');
    
    body.replaceText("New!", "NEW!");
    body.replaceText("new!", "NEW!");
    
    return
    
    // Private Functions
    // -----------------
    
    function highlightText(startTag) {
      for (var i = 0; i < para.length; i++) {
        var nextPara = para[i];
        var from = nextPara.findText(startTag);
        var to = nextPara.findText(endTag, from);
        var text = nextPara.editAsText();
        
        if ((to != null && from != null) && (to.getStartOffset() > 0)) {
          text.setAttributes(from.getStartOffset(), to.getStartOffset(), highlightStyle);
        }        
      }    
      
    } // formatDoc_.applyColorToText.highlightText()
    
  } // formatDoc_.applyColorToText()
  
  function updateDashes() {
    body.replaceText("-", "–"); // hyphen -> en dash 
    body.replaceText("—", "–"); // em dash -> en dash 
  }

} // formatDoc_()