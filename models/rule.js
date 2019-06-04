const mongoose = require('mongoose');

const ruleSchema = mongoose.Schema(
  {
    pdfLayout: String,
    targetName: String,
    anchorMethod: String, //anchorBeforeTarget, beginsWithAnchor, anchorAfterTarget, endsWithAnchor,
    anchorValue: String,
    determinationMethod: String, // wordsCount, linesCount, textLength
    determinationValue: Number,
    textFilters: {
      startCorrection: Number,
      endCorrection: Number,
      lineBreaksToBlankSpases: Boolean,
      findAndChange: [{ oldSymbol: String, newSymbol: String }]
    }
  },
  {
    timestamps: true
  }
);
/*
let Rule = mongoose.model('Rule', ruleSchema);
module.exports = Rule;
*/
module.exports = mongoose.models.Rule || mongoose.model('Rule', ruleSchema);
