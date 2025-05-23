const router = require("express").Router();
let social = require("../models/Scoremod");
router.route("/add").post((req,res)=>{
    const finalScore = req.body.finalScore;
    const currentLevel = req.body.currentLevel;



    const newSocial = new social({
        finalScore,
        currentLevel


    })

    newSocial.save().then(()=>{
      res.json("Added")
    }).catch((err)=>{
        console.log(err);
    })



})


router.route("/").get((req,res)=>{

social.find().then((Scoreroute)=>{
  res.json(Scoreroute)

}).catch((err)=>{
    console.log(err)
})

})






router.route("/get/:id").get(async(req,res)=>{
    let questionId = req.params.id;
    const sociall = await social.findById(questionId)
    .then((social)=>{
       res.status(200).send({status: "Fetched" ,social});
    }).catch((err)=>{
      console.log(err.message);
      res.status(500).send({status: "Error with get responses",error:err.message});
  
    })
  
  
      
  } )





module.exports = router;