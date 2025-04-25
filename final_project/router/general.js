const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password } = req.body;

  const foundUser = users.filter((user) => user.username === username)
  if(foundUser.length != 0) {
      return res.status(200).json({message: "Username is already taken!"});
} else {
      users.push({username, password})
      return res.status(200).json({message: "Registered successfuly!"});
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json({data: books});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(400).json({message: "Book with given ISBN is not found"});
  return res.status(200).json({data: book});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const { author } = req.params;
    if(!author) return res.status(404).json({message: "Author parameter was not passed"});
    const book = Object.values(books).find(book => book.author === author);
    if(!book) return res.status(404).json({message: `Book not found by the author: "${author}"`})
    return res.status(200).json({data: book});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const { title } = req.params;
  if(!title) return res.status(400).json({message: "Title was not passed"});
  const filteredBooks = Object.values(books).filter((book) => book.title === title);
  return res.status(200).json({data: filteredBooks});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  const reviews = books[isbn].reviews;
  if(!reviews.length > 0) return res.status(404).json({data: reviews, message: "Reviews not found for given ISBN"})

  return res.status(200).json({data: reviews});
});

module.exports.general = public_users;
