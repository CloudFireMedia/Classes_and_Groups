// jshint - 28Oct2019

function formatDoc_() {
  var body = Utils.getDoc(TEST_DOC_ID_).getBody();
  var paragraphs = body.getParagraphs();
  
  paragraphs.forEach(function(paragraph, paragraphIndex) {
    var text = paragraph.getText().trim();
    var wordArray = text.split(' ');
    var firstWord = wordArray[0].toUpperCase();    
    var firstTwoWords = (wordArray[0] + ' ' + wordArray[1]).toUpperCase();
    var isFirstWordDayOfWeek = DAYS_OF_WEEK_.indexOf(firstWord) !== -1; 
    var justASingleWord = (wordArray[1] == undefined);
    var timeRegex = new RegExp(/([0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|([1-9]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|(1[0-2]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))/);
    var isTimeString = timeRegex.test(firstWord);
    
    if ((justASingleWord && isFirstWordDayOfWeek) || (firstTwoWords === 'OTHER EVENTS')) {

      // Day of week or "Other Events" title
      paragraph.editAsText().setText(text.toUpperCase());
      setTextStyle_(paragraph, 'HEADING1');

    } else if (isTimeString) {

      setTextStyle_(paragraph, 'HEADING2');

    } else {
    
      if (found_('|', text)) {
      
        // Event title               
        setTextStyle_(paragraph, 'HEADING3');
        var toTitleCase = Utils.toTitleCase(text);
        paragraph.editAsText().setText(toTitleCase);
      
      } else {
      
        var nextIndex = paragraphIndex + 1;

        if (!found_('>>', firstWord) && (nextIndex < paragraphs.length)) {
        
          // This paragraph does not begin with '>>' and there is one after that
          
          var nextParaText = paragraphs[nextIndex].getText();          
          var nextParaWords = nextParaText.split(' ');
          var nextParaFirstWord = nextParaWords[0];
          
          if (!found_('>>', nextParaFirstWord)) {
          
            // Neither this or the next paragraph start with '>>', 
            // so event description where event details DO NOT follow in the next line
            setTextStyle_(paragraph, 'HEADING4');

          } else {

            // This paragraph does not start with '>>', but the next one does  
            // so event description where event details DO  follow in the next line
            setTextStyle_(paragraph, 'HEADING5');
          }
          
          var toSentenceCase = Utils.toSentenceCase(text);
          paragraph.editAsText().setText(toSentenceCase);
                    
        } else { // Starts with '>>'

          setTextStyle_(paragraph, 'HEADING6');
        }
      }
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