const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const socialSchema = new Schema({

    finalScore: {
       type : String,
       required: true
    },


    currentLevel: {
        type : String,
        required: true
     },

})


const Scoreroute = mongoose.model("Scoreroute" ,socialSchema );
module.exports = Scoreroute;