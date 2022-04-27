const express = require("express");
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

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  //log the POST request body to the console
  res.send("Ok: " + num);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});