//requirements
const express = require("express");
const cookieParser = require('cookie-parser');

//setup and middlewares
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

//function to generate a random ID for new user IDs and for new tiny URLS
let randomId = function generateRandomString() {
  const random_string = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);    
  return random_string
};

//object to store user's saved URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//object to store user information
const users = {
  "userRandomID": {
    user_id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    user_id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//function to retrieve variables from a template
// function getTemplateVars(req) {
//   const templateVars = { 
//     //username: req.cookies["username"],
//     user: users[req.cookies["user_id"]]
//   };
//   return templateVars;
// };

//returns an array
const emailLookup = function(usersDB, inputEmail) {
  for (let user in usersDB) {
    let email = usersDB[user]["email"];
    if (inputEmail === email) {
      return true;
    }
  }
  return false;
};


app.use(bodyParser.urlencoded({extended: true}));
//allows us to convert the request body from a Buffer into a string
//then adds the data to the req(request) object under the key body
//using our form as an example, the data in the input field will be avaialbe to us 
//in the req.body.longURL variable, which we can store in our urlDatabase object

//sets up cookies
app.use(cookieParser());


//set ejs as view engine
app.set("view engine", "ejs");


//routes / endpoints /crud operations

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
   urlDatabase[randomId] = req.body.longURL;
  
   res.redirect(302, "/urls/" + randomId)
 });


//route for all urls
//includes ejs template object
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, //passes the database/object to the urls_index page
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_index", templateVars);
});

//get route to show the form for making a tiny URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  
  res.render("urls_new", templateVars);
});

//route for one single shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  
  res.render("urls_show", templateVars);
});


//Update long URL's short URL
app.post("/urls/:shortURL", (req, res) => { 
  const shortURL = req.params.shortURL;

  urlDatabase[shortURL] = req.body.updatedURL;

  res.redirect("/urls")
});

//delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect(302, "/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  const username = req.body.username;

  res.cookie('username', username);
  res.redirect(302, "/urls");
});

app.post("/logout", (req, res) => {
  
  res.clearCookie('user_id');
  res.redirect(302, "/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  res.render("register",templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
 
  //error handling
  if (email === "" || password === "") {
    res.status(404).send("Email and password fields cannot be left blank.")

  } else if (emailLookup(users, email)){
    res.status(404).send("An account with that email address already exists.")

  } else {
    //add new user
    let newUser = randomId();
    users[newUser] = {
      user_id: newUser,
      email: email,
      password: password
    };
    
    //set cookie to user_id
    res.cookie('user_id', users[newUser]["user_id"]);
    res.redirect(302, "/urls");
  };

});

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//Do I need to implement these edge case (from URL shortening part 2):
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?