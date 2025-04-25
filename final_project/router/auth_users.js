const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password } = req.body;

  if(!username || !password) {
    return res.status(400).json({ message: "Username and password are required."});
  }

  if(!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "Invalid login credentials."});
  }

  req.session.user = username;

  let accessToken = jwt.sign(
    {
        data: username,
    },
    'secret-key',
    {
        expiresIn: 60 * 60
    }
  );
  return res.status(200).json({message: "Login succesful", token: accessToken});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const {isbn} = req.params;
  const {rating, description} = req.query;
  const username = req.session.user;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }
  

  books[isbn].reviews[username] = {
     rating: parseInt(rating), description
  }
  return res.status(200).json({message: "Review has been posted sucessfully"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.user;
    const { isbn } = req.params;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user." });
    }

    const clonedReviews = {...books[isbn].reviews};

    delete books[isbn].reviews[username];
    res.status(200).json({message: "Book review has been deleted", before: clonedReviews, after: books[isbn].reviews})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
