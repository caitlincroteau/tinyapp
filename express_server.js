// ----------------------- REQUIREMENTS

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');
const { generateRandomString } = require('./helpers');
const { urlsForUser } = require('./helpers');

//URL databse
const urlDatabase = {};

//users database
const users = {};

// ----------------------- SETUP AND MIDDLEWARES
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
//allows us to convert the request body from a Buffer into a string
//then adds the data to the req(request) object under the key body
//using our form as an example, the data in the input field will be avaialbe to us
//in the req.body.longURL variable, which we can store in our urlDatabase object

//sets up cookies session
app.use(cookieSession({
  name: 'session',
  keys: ["key 1", "key 2", "key 3"],
  maxAge: 24 * 60 * 60 * 1000
}));

//set ejs as view engine
app.set("view engine", "ejs");

// ----------------------- ROUTES / ENDPOINTS

//server sends a response
app.get("/", (req, res) => {
  res.status(200).redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.status(200).send("<html><body>Hello <b>World</b></body></html>\n");
});

//server sends a JSON response: parameter (the urlDatabase object) converted to:
//json STRING rep.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//post route to receive the new tiny url from form submission and redirect to tiny url page
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  
  //if user is logged in, create short url, update database and redirect to short url page
  if (userID) {
    const tinyURL = generateRandomString();
    urlDatabase[tinyURL] = { longURL: req.body.longURL, userID: userID };
    return res.status(201).redirect("/urls/" + tinyURL);
  }

  res.status(401).send("Must be logged in to create a new Tiny URL.");
});


//get route for all urls
//includes ejs template object
app.get("/urls", (req, res) => {
  const inputUserID = req.session.user_id;
  const urls = urlsForUser(inputUserID, urlDatabase);
  const user = users[inputUserID];
  const templateVars = { inputUserID, urls, user };

  //if user not logged in.
  if (!inputUserID) {
    return res.status(401).send("Must be logged in to access URL list.");
  }

  res.status(200).render("urls_index", templateVars);
});


//get route to show the form for making a tiny URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  
  //if user is not logged
  if (!userID) {
    return res.status(200).redirect("/login");
  }

  const templateVars = {
    user: users[userID]
  };

  res.status(200).render("urls_new", templateVars);
});


//get route for one single shortURL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  
  //if the url doesn't exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("The Tiny URL does not exist.");
  }

  const userInputID = req.session.user_id;
  const longURL = urlDatabase[shortURL].longURL;
  
  //if user is not logged in or short url doesn't belong to user
  if (!userInputID || urlDatabase[shortURL].userID !== userInputID) {
    return res.status(401).send("Must be logged in as correct user to view Tiny URL.");
  }

  const templateVars = { shortURL, longURL, user: users[userInputID] };
  
  res.status(200).render("urls_show", templateVars);
});


//post route to update long URL's short URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  //if the url doesn't exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("The Tiny URL does not exist.");
  }

  const userInputID = req.session.user_id;

  //if user is not logged in or short url doesn't belong to user
  if (!userInputID || userInputID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You do not have permission to edit this Tiny URL");
  }

  //update long url in databse and redirect to /urls
  urlDatabase[shortURL].longURL = req.body.updatedURL;
  res.status(200).redirect("/urls");
});


//post route to delete URL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  //if the url doesn't exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("The Tiny URL does not exist.");
  }

  const userInputID = req.session.user_id;

  //if user not logged in or short url doesn't belong to user
  if (!userInputID || userInputID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You do not have permission to delete this Tiny URL");
  }

  //delete url from database and redirect
  delete urlDatabase[req.params.shortURL];
  res.status(200).redirect("/urls");
});


//get route to allow anyone to use shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  
  //if short URL doesn't exit
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("Tiny URL does not exist.");
  }

  //redirect to long URL
  const longURL = urlDatabase[shortURL].longURL;
  res.status(200).redirect(longURL);
});


//post route for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  //if user not in database
  if (!user) {
    res.status(403).send("Email not found in database.");
  
  //if hashed passwords don't match
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Incorrect password.");
  
  //set cookie as user_id and redirect
  } else {
    req.session.user_id = user.user_id;
    res.status(200).redirect("/urls");
  }
});


//get route to show login
app.get("/login", (req, res) => {
  const user = req.session.user_id;
  
  //if user already logged in, redirect to /urls
  if (user) {
    return res.status(200).redirect("/urls");
  }

  //show login page
  const templateVars = {
    user: users[user]
  };

  res.status(200).render("login", templateVars);
});


//post route for logout
app.post("/logout", (req, res) => {
  
  //clear cookie session and redirect
  req.session = null;
  res.redirect("/urls");
});


//get route to show register
app.get("/register", (req, res) => {
  const user = req.session.user_id;
  
  //if user already loggin in, redirect to /urls
  if (user) {
    return res.status(200).redirect("urls");
  }
  
  //show register page
  const templateVars = {
    user: users[user]
  };

  res.status(200).render("register",templateVars);
});


//post route to register
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
 
  //if no email or password entered
  if (email === "" || password === "") {
    res.status(400).send("Email and password fields cannot be left blank.");

  //if email is already in the database
  } else if (user !== undefined && user.email === email) {
    res.status(400).send("An account with that email address already exists.");

  } else {
    //add new user
    const newUser = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);

    users[newUser] = {
      user_id: newUser,
      email: email,
      password: hashedPassword
    };
    
    //set cookie to user_id and redirect to /urls.
    req.session.user_id = users[newUser].user_id;
    res.status(200).redirect("/urls");
  }
});

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//Do I need to implement these edge case (from URL shortening part 2):
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?