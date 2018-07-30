//Redevelopment note: change any 'new!' or 'New!' text to 'NEW!' and change font color to red
//Redevelopment note: change any '-' to ' – ' 
//Redevelopment note: remove any double spaces (function should run last)

// Function For Remove Double Spaces ... reference 'doc' not defined ... needs to be fixed
//function doubleSpaceToSingle(doc) {
//  doc = doc || DocumentApp.getActiveDocument();
//  var body = doc.getBody();
//  doc.getBody().replaceText("[ ]{2,}", " "); 
//}


var ui = DocumentApp.getUi();
var dayArray=["sunday","monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
var documentId="1cBbJ4qksyeDWfGmci8hxDRL7np3E_0CeUgJD9ss28s4";
var timeString="am ";
var timeString1="pm ";


function myFunction() {
  var body = DocumentApp.getActiveDocument().getBody();
  var paras = body.getParagraphs();
  
  for(var i=0; i<paras.length;i++)
  {
    var txt=paras[i].getText();  
    //Get First Word Of Paragraph
    var para=txt.split(" ");
    var otherEvents=para[0]+" "+para[1];
    otherEvents=otherEvents.toLowerCase();
    var firstWord=para[0];
    firstWord=firstWord.toLowerCase();
    const regex = /([0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|([1-9]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))|(1[0-2]:[0-5][0-9]((\ ){0,1})((AM)|(PM)|(am)|(pm)))/;
    var patt = new RegExp(regex);
    var res = patt.test(firstWord);
    //First Condition Check If Word Exist In Day Array... Set Heading 1
    var a = dayArray.indexOf(firstWord);
    //ui.alert(para[1]);
    //return;
    if(a!="-1" && para[1]==undefined)
    {
      //Create Stype For Day Name
      var dayNameStyle = {};
      dayNameStyle[DocumentApp.Attribute.BOLD] = true;
      dayNameStyle[DocumentApp.Attribute.FONT_SIZE] = 30;
      dayNameStyle[DocumentApp.Attribute.ITALIC] = false;
      dayNameStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';
      paras[i].setAttributes(dayNameStyle);
      paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING1);
    }else      
    if(otherEvents=="other events")
    {
      //ui.alert(otherEvents);
      //Create Style For Day Name
      var dayNameStyle = {};
      dayNameStyle[DocumentApp.Attribute.BOLD] = true;
      dayNameStyle[DocumentApp.Attribute.FONT_SIZE] = 30;
      dayNameStyle[DocumentApp.Attribute.ITALIC] = false;
      dayNameStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';
      paras[i].setAttributes(dayNameStyle);
      paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING1); 
    }
    else
      if(res)
      {
        //Second Check If Word Is Time... Heading 2      
        //Create Stype For Day Name
        var timeStyle = {};
        timeStyle[DocumentApp.Attribute.BOLD] = true;
        timeStyle[DocumentApp.Attribute.FONT_SIZE] = 10;
        timeStyle[DocumentApp.Attribute.ITALIC] = true;
        timeStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';
        paras[i].setAttributes(timeStyle);
        paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING2);
      }
    else
    {
      //Third Check For heading 3 If string contain |
      var c = txt.indexOf("|");
      if(c!=-1)
      {
        //Create Stype For Day Name
        var head3Style = {};
        head3Style[DocumentApp.Attribute.BOLD] = true;
        head3Style[DocumentApp.Attribute.FONT_SIZE] = 10;
        head3Style[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';
        paras[i].setAttributes(head3Style);
        paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING3);
      }
      else
      {
        // Check Heading 4 if a paragraph does not contain ë|í  AND does not begin with '>>' AND the immediate following paragraph does not start with '>>' = Header 4
        //Check If not Begin with >>
        var d = firstWord.indexOf(">>");
        if(d=="-1")
        {
          var nextI=i+1;
          if(nextI<paras.length)
          {
            var nextParaText=paras[nextI].getText();         
            var nextParaFirst=nextParaText.split(" ");
            var nextParaFirstWord=nextParaFirst[0];
            //Check If next para done not start with >> then heading 4
            var e = nextParaFirstWord.indexOf(">>");
            if(e=="-1")
            {
              var head4Style = {};
              head4Style[DocumentApp.Attribute.BOLD] = false;
              head4Style[DocumentApp.Attribute.FONT_SIZE] = 9.50;
              head4Style[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';
              paras[i].setAttributes(head4Style);
              paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING4);
            }
            else
            {
              var head5Style = {};
              head5Style[DocumentApp.Attribute.BOLD] = false;
              head5Style[DocumentApp.Attribute.FONT_SIZE] = 9.50;
              head5Style[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';
              paras[i].setAttributes(head5Style);
              paras[i].setHeading(DocumentApp.ParagraphHeading.HEADING5);
              
            }
          }
        }
        else
        {
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
//  doubleSpaceToSingle(doc);
}


//Function For applying red color to "NEW!"
function applyColorToText() {
  var startTag = "NE";
  var endTag = "!";
  var body = DocumentApp.getActiveDocument().getBody();
  var para = body.getParagraphs();
  var highlightStyle = {};
  highlightStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#FF0000';
  var i =0;
  for( i in para){  
    var text=para[i].editAsText().getText();
    var from = para[i].findText(startTag);
    var to =  para[i].findText(endTag,from);
    
    if((to != null && from != null) && to.getStartOffset()>0 ){
      para[i].editAsText().setAttributes(from.getStartOffset(), to.getStartOffset(), highlightStyle);
    }
  }
}

// Function For Remove Blank Paragraph
function removeBlankParagraph()
{
  var body = DocumentApp.getActiveDocument().getBody();
  var paras = body.getParagraphs();
  var i = 0;
  for (var i = 0; i < paras.length; i++) {
    if (paras[i].getText() === ""){
      try
      {
        paras[i].removeFromParent();
      }
      catch (err) {
      }
    }
  }
}
