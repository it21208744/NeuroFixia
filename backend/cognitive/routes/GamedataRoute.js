const router = require("express").Router();
let Gamedata = require("../models/Gamedata.js");

router.route("/add").post((req,res)=>{
    const accuracy = Number(req.body.accuracy);
    const memoryScore = Number(req.body.memoryScore);
    const timeSpent = Number(req.body.timeSpent);
    const gazeShiftsCount = Number(req.body.gazeShiftsCount);
    const fixationDuration = Number(req.body.fixationDuration);
    const attentionScore = Number(req.body.attentionScore);
    const score = Number(req.body.score);
    const errors = Number(req.body.errors);
    const totalTime = Number(req.body.totalTime);


    const newGamedata = new Gamedata({
        accuracy,
        memoryScore,
        timeSpent,
        gazeShiftsCount,
        fixationDuration,
        attentionScore,
        score,
        errors,
        totalTime

    })

    newGamedata.save().then(()=>{
      res.json("Game scores added")
    }).catch((err)=>{
        console.log(err);
    })

})


router.route("/").get((req,res)=>{

    Gamedata.find().then((gamedatas)=>{
      res.json(gamedatas)
    
    }).catch((err)=>{
        console.log(err)
    })
    
    })
    





module.exports = router;