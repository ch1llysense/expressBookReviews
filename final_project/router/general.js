const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let axios = require('axios');
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

//// Promise version
public_users.get('/books-promise',function (req, res) {
   axios.get("http://localhost:5000/")
    .then(response => {
        res.status(200).json({data: response.data})
    })
    .catch(error => {
        res.status(500).json({message: "Error fetching books"})
    })
});

//// Async/await version
public_users.get("/books-async-await", async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/'); 
        res.status(200).json({data: response.data});
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch books using Axios." });
      }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(400).json({message: "Book with given ISBN is not found"});
  return res.status(200).json({data: book});
 });
  

//// Async + Axios version for Book Details without Endpoint
async function getBookDetails(isbn) {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return response.data;
    } catch (error) {
        console.error("Error", JSON.stringify(error, null, 4));
        throw new Error("Fetch failed");
    }
}




// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const { author } = req.params;
    if(!author) return res.status(404).json({message: "Author parameter was not passed"});
    const book = Object.values(books).find(book => book.author === author);
    if(!book) return res.status(404).json({message: `Book not found by the author: "${author}"`})
    return res.status(200).json({data: book});
});


// Promise based + Axios
function getBookDetailsByAuthor(author) {
    return new Promise((resolve, rejected) => {
        axios.get(`http://localhost:5000/author/${author}`)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                rejected(new Error("Fetch of book's details failed"))
            })
    })
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const { title } = req.params;
  if(!title) return res.status(400).json({message: "Title was not passed"});
  const filteredBooks = Object.values(books).filter((book) => book.title === title);
  return res.status(200).json({data: filteredBooks});
});

// Async/await + Axios for getting books based on title
async function getBooksByTitle(title) {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        return response.data;
    } catch (err) {
        throw new Error("Fetch failed");
    }
}

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  const reviews = books[isbn].reviews;
  if(!reviews.length > 0) return res.status(404).json({data: reviews, message: "Reviews not found for given ISBN"})

  return res.status(200).json({data: reviews});
});

module.exports.general = public_users;
