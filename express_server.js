//requirements
const express = require("express");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');
const { generateRandomString } = require('./helpers');
const { urlsForUser } = require('./helpers');

//setup and middlewares
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
//allows us to convert the request body from a Buffer into a string
//then adds the data to the req(request) object under the key body
//using our form as an example, the data in the input field will be avaialbe to us
//in the req.body.longURL variable, which we can store in our urlDatabase object

//sets up cookies
// app.use(cookieParser());

//sets up cookies session
app.use(cookieSession({
  name: 'session',
  keys: ["key 1", "key 2", "key 3"],
  maxAge: 24 * 60 * 60 * 1000
}));

//set ejs as view engine
app.set("view engine", "ejs");


//new URL databse
const urlDatabase = {
  // b6UTxQ: {
  //   longURL: "https://www.tsn.ca",
  //   userID: "userRandomID"
  // },
  // i3BoGr: {
  //   longURL: "https://www.google.ca",
  //   userID: "user2RandomID"
  // },
  // i3BoGr: {
  //   longURL: "https://www.cats.com",
  //   userID: "user3RandomID"
  // }
};

//object to store user information
const users = {
  // "userRandomID": {
  //   id: "userRandomID", 
  //   email: "user@example.com", 
  //   password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  // },
  // "user2RandomID": {
  //   id: "user2RandomID", 
  //   email: "user2@example.com", 
  //   password: bcrypt.hashSync("dishwasher-funk", 10)
  // },
  // "user3RandomID": {
  //   id: "user3RandomID", 
  //   email: "user3@example.com", 
  //   password: bcrypt.hashSync("hello-planet", 10)
  // }
};

//function to retrieve variables from a template
// function getTemplateVars(req) {
//   const templateVars = {
//     //username: req.cookies["username"],
//     user: users[req.cookies["user_id"]]
//   };
//   return templateVars;
// };

//server sends a response
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//server sends a JSON response: parameter (the urlDatabase object) converted to:
//json STRING rep.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//post route to receive the new tiny url from form submission
//and redirect to tiny url page
app.post("/urls", (req, res) => {
  //const userID = req.cookies["user_id"];
  const userID = req.session.user_id;
  
  if(userID) {
    const tinyURL = generateRandomString();
    urlDatabase[tinyURL] = { longURL: req.body.longURL, userID: userID };
    
    return res.redirect("/urls/" + tinyURL);
  }

  res.status(401).send("Must be logged in to create a new tiny url.");
});

//route for all urls
//includes ejs template object
app.get("/urls", (req, res) => {
  //const inputUserID = req.cookies["user_id"];
  const inputUserID = req.session.user_id;
  const urls = urlsForUser(inputUserID, urlDatabase);
  const user = users[inputUserID];
  const templateVars = { inputUserID, urls, user };
  console.log("URLS", urls)

  //if user not logged in.
  if (!inputUserID) {
    return res.send("User must login to access URLS.")
  }

  res.render("urls_index", templateVars);
});

//get route to show the form for making a tiny URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    //user: users[req.cookies["user_id"]]
    user: users[req.session.user_id]
  };

  if(!templateVars.user) {
    return res.redirect("/login")
  }
  
  res.render("urls_new", templateVars);
});

//route for one single shortURL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //const userInputID = req.cookies["user_id"];
  const userInputID = req.session.user_id;
  
   //if the url doesn't exist
   if (!urlDatabase[shortURL]) {
    return res.send("The short URL does not exist.")
  }

  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user: users[userInputID] };

  //if user is not logged in or short url doesn't belong to user
  if (!userInputID || urlDatabase[shortURL].userID !== userInputID) {
    return res.status(401).send("Must be logged in as correct user to see short URL.")
  }
  
  res.render("urls_show", templateVars);
});

//Update long URL's short URL
app.post("/urls/:shortURL", (req, res) => {
  //const userInputID = req.cookies["user_id"];
  const userInputID = req.session.user_id;
  const shortURL = req.params.shortURL;

  //if the url doesn't exist
  if (!urlDatabase[shortURL]) {
    return res.send("The short URL does not exist.")
  }

  //if user is not logged in or short url doesn't belong to user
  if (!userInputID || userInputID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You do not have permission to edit this short URL")
  }

  urlDatabase[shortURL].longURL = req.body.updatedURL;

  res.redirect("/urls");
});

//delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //const userInputID = req.cookies["user_id"];
  const userInputID = req.session.user_id
  const shortURL = req.params.shortURL;

   //if the url doesn't exist
   if (!urlDatabase[shortURL]) {
    return res.send("The short URL does not exist.")
  }

  //if user not logged in or short url doesn't belong to user
  if (!userInputID || userInputID !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You do not have permission to delete this short URL")
  }

  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

//allow anyone to use shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  
  if(!urlDatabase[shortURL]) {
    return res.send("Short URL does not exist.")
  }

  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

//login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  //if user not in db
  if (!user) {
    res.status(403).send("Email not found in database.");
  
    //if hashed passwords don't match
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Incorrect password.");
  
  //set cookie as user_id
  } else {
    //res.cookie('user_id', user.user_id);
    req.session.user_id = user.user_id;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    //user: users[req.cookies["user_id"]]
    user: users[req.session.user_id]
  };

  if (!templateVars.user) {
    return res.render("login", templateVars);
  }
  
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  
  //res.clearCookie('user_id');
  //clear cookie session
  req.session = null;
  res.redirect("/urls");
});

//register
app.get("/register", (req, res) => {
  const templateVars = {
    //user: users[req.cookies["user_id"]]
    user: users[req.session.user_id]
  };

  if(!templateVars.user) {
    return res.render("register",templateVars);
  }

  res.redirect("urls")
});

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
    console.log("user DB", users)
    
    //set cookie to user_id
    //res.cookie('user_id', users[newUser]["user_id"]);
    req.session.user_id = users[newUser].user_id;
    res.redirect("/urls");
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