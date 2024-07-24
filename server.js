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
const port = 3002;
const path = require("path");
const fs = require('fs');


const legoData = require("./modules/legoSets");

app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.render("home");
});


app.get("/about", (req, res) => {
  res.render("about");
});


const csvFilePath = path.join(__dirname, 'sets.csv');
const csvData = fs.readFileSync(csvFilePath, 'utf-8');
const legoSets = csvData.split('\n').slice(1).map(row => {
    const [set_num, name, year, theme_id, num_parts, img_url] = row.split(',');
    return { set_num, name, year, theme_id, num_parts, img_url };
});


app.get('/lego/sets', (req, res) => {
    res.render('sets', { sets: legoSets });
});


app.get("/lego/set/:num", (req, res) => {
  legoData.initialize()
    .then(() => {
      const setNum = req.params.num; 

     
      console.log("Requested Set Number:", setNum);

      return legoData.getSetByNum(setNum);
    })
    .then((set) => {
     
      res.render("set", { set: set });
    })
    .catch((err) => {
     
      console.error("Error fetching set details:", err);
      res.status(404).render('404', { message: `Set not found with set_num: ${req.params.num}` });
    });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});