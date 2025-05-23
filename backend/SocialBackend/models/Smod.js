const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const socialSchema = new Schema({

    q1: {
       type : String,
       required: true
    },

    q2:{
        type : String,
        required: true

    },

    q3:{
        type : String,
        required: true

    },
    
    q4:{
        type : String,
        required: true

    },
    q5:{
        type : String,
        required: true

    },
    q6:{
        type : String,
        required: true

    },
    q7:{
        type : String,
        required: true

    },
    q8:{
        type : String,
        required: true

    },
    q9:{
        type : String,
        required: true

    },
    q10:{
        type : String,
        required: true

    },
    
    risk_prediction: {
        type: String, 
        required: false // Optional, since it will be added after the initial save
    },

   important_negative_responses: { type: [String], default: [] },
   importance_scores: { type: Map, of: Number },


    top_3_features: [
  {
    feature: String,
    score_percent: Number,
  },
],
date: {
    type: Date,
    default: Date.now // Optional default
  }
});
    
    






const Sroute = mongoose.model("Sroute" ,socialSchema );
module.exports = Sroute;