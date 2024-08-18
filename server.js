/******************************************************************************** 
*  WEB322 – Assignment 06
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Noah Abebe Student ID: 142483239 Date:5/31/24
* 
********************************************************************************/ 
const clientSessions = require("client-sessions");
const express = require('express');
const app = express();
const path = require('path');
const legoSets = require('./modules/legoSets');
const authData = require('./modules/auth-service.js');
const port = process.env.PORT || 3003;

app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "alksdjflaasdfasdfljad",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));

legoSets
  .initialize()
  .then(authData.initialize)
  .then(
    app.listen(port, () => {
      console.log(`Server listening on: ${port}`);
    })
  )
  .catch((err) => {
    console.log(err, "Error initializing services");
  });

app.get("/login", (req, res) => {
  res.render("login", { page: "/login", errorMessage: "" });
});

app.get("/register", (req, res) => {
  res.render("register", {
    page: "/register",
    errorMessage: "",
    successMessage: "",
  });
});

app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", {
        successMessage: "User created",
        errorMessage: "",
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
        successMessage: "",
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { page: "/userHistory", user: req.session.user });
});
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/lego/sets', (req, res) => {
  legoSets.initialize()
    .then(() => {
      return legoSets.getAllSets();
    })
    .then((sets) => {
      res.render('sets', { sets });
    })
    .catch((err) => {
      console.error('Error fetching sets:', err);
      res.status(500).send('Error fetching sets');
    });
});

app.get('/lego/set/:num', (req, res) => {
  legoSets.initialize()
    .then(() => {
      const setNum = req.params.num;
      return legoSets.getSetByNum(setNum);
    })
    .then((set) => {
      res.render('set', { set });
    })
    .catch((err) => {
      console.error('Error fetching set details:', err);
      res.status(404).render('404', { message: `Set not found with set_num: ${req.params.num}` });
    });
});

app.get('/lego/addSet', (req, res) => {
  legoSets.getAllThemes()
    .then(themeData => {
      res.render('addSet', { themes: themeData });
    })
    .catch(err => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.post('/lego/addSet', (req, res) => {
  legoSets.addSet(req.body)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch(err => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/editSet/:num', (req, res) => {
  const setNum = req.params.num;

  Promise.all([legoSets.getSetByNum(setNum), legoSets.getAllThemes()])
    .then(([setData, themeData]) => {
      res.render('editSet', { set: setData, themes: themeData });
    })
    .catch((err) => {
      res.status(404).render('404', { message: `Unable to retrieve data: ${err}` });
    });
});


app.post('/lego/editSet', (req, res) => {
  const set_num = req.body.set_num;
  const setData  = req.body;

  legoSets.editSet(set_num, setData)
    .then(() => {
      res.redirect(`/lego/sets`);
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/deleteSet/:num', (req, res) => {
  const setNum = req.params.num;

  legoSets.deleteSet(setNum)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});



