# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Users must register or login to create and store short URLs in their user profile. Users can only edit or delete the short URLs stored in their profile. Once a user creates a short URL, it can be used by anyone to access the corresponding long URL. 

## Final Product

!["Animated GIF of editing short URL"](https://github.com/caitlincroteau/tinyapp/blob/main/docs/tinyApp.gif?raw=true)

!["Screenshot of Register page"](https://github.com/caitlincroteau/tinyapp/blob/main/docs/register-page.png?raw=true)
!["Screenshot of URLs page"](https://github.com/caitlincroteau/tinyapp/blob/main/docs/urls-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## For LHL Mentors' Testing

- If you have nodemon installed, run the sever using the `npm start` command.
- To run tests in the test directory, use the `mocha` command.
