const express = require("express");
const bodyParser= require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app= express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://almas:Test-123@klaster1.7n6dahm.mongodb.net/SecretDB", {
  useNewUrlParser: true
});
const user= new mongoose.Schema({
  name: String ,
  password : String
});

const User = mongoose.model("User", user)

app.get("/",function(req,res){
  res.render("home");
})

var USERNAME = "";

app.route("/registration")
.get(function(req,res){
  res.render("registration");
})
.post(function(req,res){
User.findOne({name:req.body.RegName}, function(err,docs){
  if(!err){

    if(docs==null){
      console.log("New user");
      const newUser= new User({
        name:req.body.RegName,
        password:req.body.RegPass
      });
      newUser.save();
      res.redirect("/login");
    }else{
    console.log("Not new user");
    }
  }
});
});

const memory = new mongoose.Schema({
  name:String,
  key:String
})
const Memory= mongoose.model("Memory",memory);
const lilo = new Memory({
  name:"",
  key:"key"
})
lilo.save();


app.post("/exit",function(req,res){
  Memory.findOneAndUpdate({key:"key"},{$set:{name:""}},function(err){
    if(!err){
      console.log("exit and delated");
    }else{
      console.log(err);
    }
  });
  res.redirect("/");
})

app.post("/editSecret",function(req,res){
  const editSecretId=req.body.editButton;
  Secret.findById(editSecretId,function(err,docs){
    console.log("///"+docs._id);
    res.render("editSecret", {
      username:USERNAME,
      id:docs._id,
      title: docs.title,
      content: docs.text
    });
  });
})

app.post("/changePage",function(req,res){
const editTitle = req.body.editTitle;
const editText = req.body.editText;
const id = req.body.idwka;
console.log("******"+id);
Secret.findOneAndUpdate({_id:id },{$set:{title:editTitle, text:editText}},function(err){
  if(!err){
    console.log("--YYYYEEEEEPPPPP--");
  }else{
    console.log(err);
  }
})
res.redirect("/mySecrets")

});
app.post("/deleteSecret",function(req,res){
  const deleteSecretId = req.body.deleteButton;
  console.log(deleteSecretId);
  Secret.findOneAndDelete({ _id: deleteSecretId },function(err){
    if(err){
      console.log(err);
    }
  });
res.redirect("/mySecrets");
})

app.route("/login")
.get(function(req,res){
  res.render("login");
})
.post(function(req,res){
  const userName = req.body.LogName;
  const userPass = req.body.LogPass;

  User.findOne({name:userName}, function(err,docs){
    if(!err){
      if(docs==null){
        console.log("Ты не зарегистрирован");
      }else{
        if(docs.password === userPass){
         Memory.findOneAndUpdate({key:"key"},{$set:{name:userName}},function(err){
           if(!err){
             console.log("----");
           }else{
             console.log(err);
           }
         })

          res.redirect("secretMain");
        }else{
          console.log("Не правильный пароль");
        }
      }
    }
  });


})

const secret = new mongoose.Schema({
  user:String,
  title:String,
  text: String
})



const Secret = mongoose.model("Secret", secret);

function Mmemory(){
  Memory.findOne({key:"key"},function(err,docs){
    if(!err){
      if(docs!=null){
        USERNAME=docs.name;
      }
    }
  })
};
app.route("/addPage")
.get(function(req,res){
  Mmemory();
  res.render("addPage", {username:USERNAME});
})
.post(function(req,res){
  var title = req.body.addTitle;
  const text = req.body.addText;
  title = title.trim();
  Mmemory();
  const newSecret = new Secret({
    user:USERNAME,
    title:title,
    text: text
  })

  newSecret.save();
  Mmemory();
  res.redirect("/mySecrets");
})

app.get("/mySecrets",function(req,res){
  Mmemory();
  console.log("-----"+USERNAME);

  Secret.find({user:USERNAME},function(err,doci){
console.log(doci);
    res.render("mySecrets", {array:doci,username:USERNAME});
  })
});

app.get("/mySecrets/:secretName", function(req, res){
  const requestedTitle =req.params.secretName;

Secret.findOne({title:requestedTitle},function(err,docs){
  res.render("exatSecrect", {
    title: docs.title,
    content: docs.text,
    username:USERNAME
  });
});
});

app.get("/Secrets/:secretName", function(req, res){
  const requestedTitle =req.params.secretName;

Secret.findOne({title:requestedTitle},function(err,docs){
  res.render("exatSecrect", {
    title: docs.title,
    content: docs.text,
    username:USERNAME
  });
});
});

app.get("/secretMain",function(req,res){
    Mmemory();
  Secret.find(function(err,docs){
    if(!err){

        res.render("secretMain",{array:docs, username:USERNAME});
    }
  })

})


app.listen(3000,function(){
  console.log("Server is running on 3000 port");
})
