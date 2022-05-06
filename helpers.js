//if input email matches db email, return the user object. Else, return undefined.

const getUserByEmail = function(inputEmail, usersDB) {
  for (let user in usersDB) {
    let email = usersDB[user]["email"];
    if (inputEmail === email) {
      return usersDB[user];
    }
  }
  return undefined;
};


//function to generate a random ID for new user IDs and for new tiny URLS
const generateRandomString = function() {
  const randomString = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
  return randomString;
};

//returns urls object of urls that match input user id with user id in urlDatabse
const urlsForUser = function(id, urlDatabase) {
  const urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};