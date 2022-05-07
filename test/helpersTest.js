const assert = require('chai').assert;
const { getUserByEmail } = require('../helpers');
const { generateRandomString } = require('../helpers');
const { urlsForUser } = require('../helpers');

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

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  },
  r5kTw2: {
    longURL: "https://www.cats.com",
    userID: "userRandomID"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user, testUsers[expectedUserID]);
  });

  it('should return undefined if email not in users database', function() {
    const user = getUserByEmail("caitlin@aol.com", testUsers);
    const expectedUserID = undefined;
    assert.deepEqual(user, expectedUserID);
  });

});

describe('generateRandomString', function() {
  it('should generate a random string', function() {
    const newString = generateRandomString();
    assert(typeof newString, "string");
  });
});

describe('urlsForUser', function() {
  it('should return an object of short urls from url database that match input user id', function() {
    const user = "userRandomID";
    const urls = urlsForUser(user, testUrlDatabase);
    const expectedUrls = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
      },
      i3BoGr: {
        longURL: "https://www.cats.com",
        userID: "userRandomID"
      }
    };
    assert.deepEqual(urls, expectedUrls);
  });
});