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

module.exports = getUserByEmail;