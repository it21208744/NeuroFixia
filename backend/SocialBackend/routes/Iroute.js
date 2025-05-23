const router = require("express").Router();
let social = require("../models/Imod");
router.route("/add").post((req,res)=>{
    const age = req.body.age;
    const gender  =req.body.gender;
    const lang =req.body.lang;



    const newSocial = new social({
        age,
        gender,
        lang


    })

    newSocial.save().then(()=>{
      res.json("Added")
    }).catch((err)=>{
        console.log(err);
    })



})


router.route("/").get((req,res)=>{

social.find().then((Iroute)=>{
  res.json(Iroute)

}).catch((err)=>{
    console.log(err)
})

})

router.route("/update/:id").put(async (req,res)=>{
    
   let questionId = req.params.id;
   const {age,gender,lang} = req.body;
   

   const updateSocial = {
     
    age,
    gender,
    lang

   }

   const update = await social.findByIdAndUpdate(questionId , updateSocial ).then(()=>{
    res.status(200).send({status: "Updated" })
   }).catch((err)=>{
    res.status(500).send({status: "Error with updating data" , error: err.message })

   })
    

})

router.route("/delete/:id").delete(async(req,res)=>{
  let questionId = req.params.id;
  await social.findByIdAndDelete(questionId)
  .then(()=>{
     res.status(200).send({status: "Deleted"});
  }).catch((err)=>{
    console.log(err.message);
    res.status(500).send({status: "Error with deleting",error:err.message});

  })


    
} )


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