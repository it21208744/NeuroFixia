const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gamedataSchema = new Schema({

    accuracy: {
        type: Number,
        required: true,
      },
      memoryScore: {
        type: Number,
        required: true,
      },
      timeSpent: {
        type: Number,
        required: true,
      },
      gazeShiftsCount: {
        type: Number,
        required: true,
      },
      fixationDuration: {
        type: Number,
        required: true,
      },
      attentionScore: {
        type: Number,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      errors: {
        type: Number,
        required: true,
      },
      totalTime: {
        type: Number,
        required: true,
      }

  
})

const Game = mongoose.model("Cognitive",gamedataSchema);

module.exports = Game;