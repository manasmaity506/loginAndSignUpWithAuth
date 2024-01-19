const express = require('express');
const bcrypt=require("bcrypt");
const collection=require("./config");

const app = express();
const port = 7000;

app.use(express.json());  
app.use(express.urlencoded({extended: false}));
 
app.use('/api/studentManagement',require('./routes/api/studentManagement')); // not used

app.set('view engine','ejs');

app.use(express.static("public")); 

app.get("/signup",(req,res)=>{
  res.render("signup");
});

app.get("/",async(req,res)=>{
  const users= await collection.find({});
  res.render("login",{
    users :users
  });
});




app.post("/signup",async(req,res)=>{
    const data={
      name: req.body.username,
      password: req.body.password
    }


    const existingUser= await collection.findOne({name: data.name});

    if(existingUser){
      res.send("User already exists. Please choose a different username.");
    }else{
      const saltRounds=10; 
      const hashedPassword= await bcrypt.hash(data.password, saltRounds);
      data.password=hashedPassword; 
      
      const newuser= new collection(data);
      const usersave=await newuser.save();

      res.redirect("/");
    }

    
});


app.post("/login",async (req,res)=>{
  try{
    const check=await collection.findOne({name: req.body.username});
    if(!check){
      res.send("user name cannot found");
    }

    const isPasswordMatch=await bcrypt.compare(req.body.password,check.password);
    if(isPasswordMatch){
      async function runProcess(){
        const users= await collection.find({});
        res.render("home",{
          users: users
        })
      };
      runProcess();

      app.get("/edit/:id",async(req,res)=>{
        const {id}=req.params;
        const user=await collection.findById({_id:id});
        if(user==null){
          res.send("No such id found");
        }
        else{
          res.render("edit",{
            user: user
          })
        }
      })

      app.post("/update/:id",async(req,res)=>{
        const data={
          name: req.body.username,
          password: req.body.password
        }
        const {id} =req.params;
        // const {name,password}=req.body;
        const saltRounds=10; 
        const hashedPassword= await bcrypt.hash(data.password, saltRounds);
        data.password=hashedPassword;

        const updateuser = await collection.findByIdAndUpdate({_id:id},
            data,
            {new:true})
          res.redirect('back');
    })
    
    app.get("/delete/:id",async(req,res)=>{
        const {id} =req.params;
    const deleteuser =await collection.findByIdAndDelete({_id:id});
    res.redirect('back');
    })


      // app.get("/login",async(req,res)=>{
      //   const users= await collection.find({});
      //   res.render("home",{
      //     users: users
      //   });
      // });

    }else{
      res.send("wrong password");
    }
  }
  catch{
    res.send("wrong Details");
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});