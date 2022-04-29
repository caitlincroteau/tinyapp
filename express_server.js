//requirements
const express = require("express");

//setup and middlewares
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

function generateRandomString() {
  const random_string = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);    
  return random_string
}

let num = generateRandomString();

app.use(bodyParser.urlencoded({extended: true}));
//allows us to convert the request body from a Buffer into a string
//then adds the data to the req(request) object under the key body
//using our form as an example, the data in the input field will be avaialbe to us 
//in the req.body.longURL variable, which we can store in our urlDatabase object

//set ejs as view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//routes / endpoints /crud operations

//GET
app.get("/", (req, res) => {
  res.send("Hello");
});
//server sends a response

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//server sends a JSON response: parameter (the urlDatabase object) converted to:
//json STRING rep.

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//route for all urls
//includes ejs template object

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; //passes the database/object to the urls_index page.
  
  res.render("urls_index", templateVars);
});

//get route to show the form for making a tiny URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//route for one single shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POST

//post route to receive the new tiny url from form submission
//and redirect to tiny url page
app.post("/urls", (req, res) => {
 //console.log("req.body: ", req.body);

  urlDatabase[num] = req.body.longURL;
  //console.log(urlDatabase)

  res.redirect(302, "/urls/" + num)
  //log the POST request body to the console
  //res.send("Ok: " + num);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect(302, "/urls");
});

//LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//Do I need to implement these edge case (from URL shortening part 2):
// What would happen if a client requests a non-existent shortURL?
// What happens to the urlDatabase when the server is restarted?
// What type of status code do our redirects have? What does this status code mean?