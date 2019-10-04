function formatDoc_() {

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
      setStyle(BOLD, 30, NOT_ITALIC, 'Lato', 'HEADING1')
           
    } else if (isTimeString) {

      setStyle(BOLD, 10, ITALIC, 'Lato', 'HEADING2')

    } else {
    
      // Third Check For heading 3 If string contain |      
      if (txt.indexOf('|') !== -1) {
      
        // Event title
        setStyle(BOLD, 10, NOT_ITALIC, 'Lato', 'HEADING3')
      
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
          
        } else { // Starts with '>>'

          setStyle(NOT_BOLD, 9.5, ITALIC, 'Lato', 'HEADING6')
        }
      }
    }
    
  } // for each paragraph
  
  removeBlankParagraph();
  applyColorToText();
  doubleSpaceToSingle();
  
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
    for (var i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].getText() === '') {
        try {
          paragraphs[i].removeFromParent();
        } catch (err) {}
      }
    }
  }  

  // Apply red color to "NEW!"
  function applyColorToText() {
    var startTag = 'NE',
        endTag = '!',
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

} // formatDoc_()