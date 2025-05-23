const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const socialSchema = new Schema({

    age: {
       type : String,
       required: true
    },

    gender:{
        type : String,
        required: true

    },

    lang:{
        type : String,
        required: true

    }
    


    



})


const Iroute = mongoose.model("Iroute" ,socialSchema );
module.exports = Iroute;