const crawler = require('crawler-request');

function fRuleParsingModule(rule, PDFURL) {
  return new Promise(function(resolve, reject) {
    crawler(PDFURL).then(function(response) {
      fExtractTarget(response.text, rule);
    });

    function fExtractTarget(text, rule) {
      //console.log(text);
      //console.log(rule);
      const pdfLayout = rule.pdfLayout,
        targetName = rule.targetName,
        anchorMethod = rule.anchorMethod, //anchorBeforeTarget, beginsWithAnchor, anchorAfterTarget, endsWithAnchor
        anchorValue = rule.anchorValue,
        determinationMethod = rule.determinationMethod, //, wordsCount, linesCount, textLength
        determinationValue = rule.determinationValue,
        startCorrection = rule.textFilters.startCorrection,
        endCorrection = rule.textFilters.endCorrection,
        lineBreaksToBlankSpases = rule.textFilters.lineBreaksToBlankSpases,
        findAndChange = rule.textFilters.findAndChange;

      let isTargetAfterAnchor;

      switch (anchorMethod) {
        case 'anchorBeforeTarget':
          text = fSliceanchorBeforeTarget(text, anchorValue);
          isTargetAfterAnchor = true;
          break;
        case 'beginsWithAnchor':
          text = fSlicebeginsWithAnchor(text, anchorValue);
          isTargetAfterAnchor = true;
          break;
        case 'anchorAfterTarget':
          text = fSliceanchorAfterTarget(text, anchorValue);
          isTargetAfterAnchor = false;
          break;
        case 'endsWithAnchor':
          text = fSliceendsWithAnchor(text, anchorValue);
          isTargetAfterAnchor = false;
          break;
        default:
          //--->!Catch!!!!!!!!!!!!!!!!!
          console.log('anchorMethod Error');
      }

      switch (determinationMethod) {
        case 'wordsCount':
          text = fSliceWordsCount(
            text,
            determinationValue,
            isTargetAfterAnchor
          );
          break;
        case 'linesCount':
          text = fSlicelinesCount(
            text,
            determinationValue,
            isTargetAfterAnchor
          );
          break;
        case 'textLength':
          text = fSliceTextLength(
            text,
            determinationValue,
            isTargetAfterAnchor
          );
          break;
        default:
          //--->!Catch!!!!!!!!!!!!!!!!!
          console.log('determinationMethod Error');
      }

      if (startCorrection)
        text = fFilterWithStartCorrection(text, startCorrection);
      if (endCorrection) text = fFilterWithEndCorrection(text, endCorrection);
      if (lineBreaksToBlankSpases)
        text = fFilterWithLineBreaksToBlankSpases(text);
      if (lineBreaksToBlankSpases)
        text = fFilterWithLineBreaksToBlankSpases(text);
      if (findAndChange.length)
        text = fFilterWithFindAndChange(text, findAndChange);
      //console.log('=====>' + text + '<=====');
      resolve(text);
      return text;
    }
  });
}

module.exports = {
  fRuleParsingModule
};

//*************** FUNCTIONS Anchor Methods ***********/

function fSliceanchorBeforeTarget(text, anchorValue) {
  text = text.slice(text.indexOf(anchorValue) + anchorValue.length);

  while (text[0] == ' ' || text[0] == '/n' || text[0].charCodeAt(0) == 10) {
    text = text.slice(1);
  }
  return text;
}

function fSlicebeginsWithAnchor(text, anchorValue) {
  return text.slice(text.indexOf(anchorValue));
}

function fSliceanchorAfterTarget(text, anchorValue) {
  text = text.slice(0, text.indexOf(anchorValue));
  while (
    text[text.length - 1] == ' ' ||
    text[text.length - 1] == '/n' ||
    text[text.length - 1].charCodeAt(0) == 10
  ) {
    text = text.slice(0, text.length - 1);
  }
  return text;
}

function fSliceendsWithAnchor(text, anchorValue) {
  return text.slice(0, text.indexOf(anchorValue) + anchorValue.length);
}

//*************** FUNCTIONS Determinations Methods ***********/

function fSliceWordsCount(text, determinationValue, isTargetAfterAnchor) {
  let count = 0;
  let pos = 0;
  if (isTargetAfterAnchor) {
    while (count !== determinationValue) {
      count++;
      pos = text.indexOf(' ', pos + 1);
    }
    return text.slice(0, pos);
  } else {
    let tempText = text;
    let textTail = '';

    for (let i = 0; i < determinationValue; i++) {
      let wordsSeparator = '';
      if (tempText.lastIndexOf(' ') < tempText.lastIndexOf('\n'))
        wordsSeparator = '\n';
      else wordsSeparator = ' ';
      if (!i) {
        textTail = text.slice(text.lastIndexOf(wordsSeparator));
        text = textTail;
      } else {
        textTail = tempText.slice(tempText.lastIndexOf(wordsSeparator));
        text = textTail + text;
      }
      tempText = tempText.slice(0, tempText.lastIndexOf(wordsSeparator));
    }

    while (text[0] == ' ' || text[0] == '/n' || text[0].charCodeAt(0) == 10) {
      text = text.slice(1);
    }

    return text;
  }
}

function fSlicelinesCount(text, determinationValue, isTargetAfterAnchor) {
  let count = 0;
  let pos = 0;
  if (isTargetAfterAnchor) {
    while (count !== determinationValue) {
      count++;
      pos = text.indexOf('\n', pos + 1);
    }
    return text.slice(0, pos);
  } else {
    let tempText = text;
    let textTail = '';
    for (let i = 0; i < determinationValue; i++) {
      if (!i) {
        textTail = text.slice(text.lastIndexOf('\n'));
        text = textTail;
      } else {
        textTail = tempText.slice(tempText.lastIndexOf('\n'));
        text = textTail + text;
      }
      tempText = tempText.slice(0, tempText.lastIndexOf('\n'));
    }
    while (text[0] == ' ' || text[0] == '/n' || text[0].charCodeAt(0) == 10) {
      text = text.slice(1);
    }
    return text;
  }
}

function fSliceTextLength(text, determinationValue, isTargetAfterAnchor) {
  if (isTargetAfterAnchor) {
    text = text.slice(0, determinationValue);
    return text;
  } else {
    text = text.slice(-determinationValue);
    return text;
  }
}

//*************** FUNCTIONS Filters ***********/
function fFilterWithStartCorrection(text, startCorrection) {
  return text.slice(startCorrection);
}

function fFilterWithEndCorrection(text, endCorrection) {
  return text.slice(0, -endCorrection);
}

function fFilterWithLineBreaksToBlankSpases(text) {
  let textWithoutLineBreaks = '';

  for (let i = 0; i < text.length; i++) {
    if (text[i].charCodeAt(0) == 10) textWithoutLineBreaks += ' ';
    else textWithoutLineBreaks += text[i];
  }

  return textWithoutLineBreaks;
}

function fFilterWithFindAndChange(text, findAndChange) {
  for (let k = 0; k < findAndChange.length; k++) {
    let newText = '';
    for (let i = 0; i < text.length; i++) {
      if (text[i] == findAndChange[k].oldSymbol)
        newText += findAndChange[k].newSymbol;
      else newText += text[i];
    }
    text = newText;
  }

  return text;
}
