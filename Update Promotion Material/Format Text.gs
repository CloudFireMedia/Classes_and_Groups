// jshint - 28Oct2019

function formatDoc_() {
  var body = Utils.getDoc(TEST_DOC_ID_).getBody();
  var paragraphs = body.getParagraphs();
  
  paragraphs.forEach(function(paragraph, paragraphIndex) {
    var text = paragraph.getText();
    var wordArray = text.split(' ');
    var firstWord = wordArray[0].toUpperCase();    
    var firstTwoWords = (wordArray[0] + ' ' + wordArray[1]).toUpperCase();
    var isFirstWordDayOfWeek = DAYS_OF_WEEK_.indexOf(firstWord) !== -1; 
    var justASingleWord = (wordArray[1] == undefined);
    var timeRegex = new RegExp(/([0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|([1-9]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|(1[0-2]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))/);
    var isTimeString = timeRegex.test(firstWord);
    
    var BOLD = true;
    var NOT_BOLD = false;
    
    var ITALIC = true;
    var NOT_ITALIC = false;

    if ((justASingleWord && isFirstWordDayOfWeek) || (firstTwoWords === 'OTHER EVENTS')) {

      // Day of week or "Other Events" title
      paragraph.editAsText().setText(text.toUpperCase());
      setStyle(BOLD, 30, NOT_ITALIC, 'Lato', 'HEADING1');
           
    } else if (isTimeString) {

      setStyle(BOLD, 10, ITALIC, 'Lato', 'HEADING2');

    } else {
    
      if (text.indexOf('|') !== -1) {
      
        // Event title
        setStyle(BOLD, 10, NOT_ITALIC, 'Lato', 'HEADING3');        
        var toTitleCase = Utils.toTitleCase(text);
        paragraph.editAsText().setText(toTitleCase);
      
      } else {
      
        var nextIndex = paragraphIndex + 1;

        if ((firstWord.indexOf('>>') === -1) && (nextIndex < paragraphs.length)) {
        
          // This paragraph does not begin with '>>' and there is one after that
          
          var nextParaText = paragraphs[nextIndex].getText();          
          var nextParaWords = nextParaText.split(' ');
          var nextParaFirstWord = nextParaWords[0];
          
          if (nextParaFirstWord.indexOf('>>') === -1) {
          
            // Neither this or the next paragraph start with '>>', 
            // so event description where event details DO NOT follow in the next line

            setStyle(NOT_BOLD, 9.5, NOT_ITALIC, 'Lato', 'HEADING4');
            
          } else {

            // This paragraph does not start with '>>', but the next one does  
            // so event description where event details DO  follow in the next line

            setStyle(NOT_BOLD, 9.5, NOT_ITALIC, 'Lato', 'HEADING5');
          }
          
          var toSentenceCase = Utils.toSentenceCase(text);
          paragraph.editAsText().setText(toSentenceCase);
                    
        } else { // Starts with '>>'

          setStyle(NOT_BOLD, 9.5, ITALIC, 'Lato', 'HEADING6');
        }
      }
    }
    
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
  
  }); // for each paragraph
  
  removeBlankParagraph();
  applyColorToText();
  doubleSpaceToSingle();
  updateDashes();
  
  return;
  
  // Private Functions
  // -----------------

  function doubleSpaceToSingle() {
    body.replaceText("[ ]{2,}", " "); 
  }
  
  function removeBlankParagraph() {
    var paragraphs = body.getParagraphs();
    var numberOfParagraphs = paragraphs.length;
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
    
    return;
    
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