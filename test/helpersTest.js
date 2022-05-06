const assert = require('chai').assert;
const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user, testUsers[expectedUserID])
  });

  it ('should return undefined if email not in users database', function() {
    const user = getUserByEmail("caitlin@aol.com", testUsers)
    const expectedUserID = undefined;
    assert.deepEqual(user, expectedUserID);
  });

});