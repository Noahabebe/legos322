/******************************************************************************** 
*  WEB322 – Assignment 03 
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Noah Abebe Student ID: 142483239 Date:5/31/24
* 
********************************************************************************/ 

const express = require("express");
const app = express();
const port = 3000; 
const path = require("path"); 

const legoData = require("./modules/legoSets");

app.use(express.static(path.join(__dirname, "public")));


  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "home.html"));
  });

  app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
  });
  
  app.get("/", (req, res) => {
    res.send("Assignment 3: Noah Abebe - 142483239");
  });

 

  app.get("/lego/sets/", (req, res) => {
    const theme = req.query.theme; 
    if (theme)
    {
        legoData.initialize().then(() => {
            legoData.getSetsByTheme(theme).then((sets)=> {
                res.send(sets); 
            });
        });
    }
    else 
    {
        legoData.initialize().then(() => {
            legoData.getAllSets().then((sets)=> {
                res.send(sets); 
            });
        }); 
    }
}); 

app.get("/lego/sets/:set_num", (req, res) => {

  legoData.initialize().then(() => {
      legoData.getSetByNum(req.params.set_num).then((sets=> {
          res.send(sets); 
      }))
      .catch((err) => {
          res.send(err); 
      }); 
  }); 
}); 

 
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

