const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});



// Get the book list available in the shop
function fetchAllBooks() {
  return new Promise((resolve, reject) => {
      resolve(books);
  });
}
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await fetchAllBooks();
    res.send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    res.status(500).send("Error fetching books");
  }
});

// Get book details based on ISBN
function fetchBookByIsbn(isbn) {
  return new Promise((resolve, reject) => {
      const booksArray = Object.values(books);
      const book = booksArray.find((book) => book.isbn === isbn);
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
  });
}
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await fetchBookByIsbn(isbn);
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).send(error);
  }
});
  
// Get book details based on author
function fetchBookByAuthor(author) {
  return new Promise((resolve, reject) => {
      const booksArray = Object.values(books);
      const book = booksArray.find((book) => book.author === author);
      if (book) {
        resolve(book);
      } else {
        reject("No such book with author: " + author);
      }
  });
}
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const book = await fetchBookByAuthor(author); 
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).send(error); 
  }
});

// Get all books based on title
function fetchBookByTitle(title) {
  return new Promise((resolve, reject) => {
      const booksArray = Object.values(books);
      const book = booksArray.find((book) => book.title === title);
      if (book) {
        resolve(book);
      } else {
        reject("No such book with title: " + title);
      }
  });
}

public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const book = await fetchBookByTitle(title); 
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).send(error); 
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const booksArray = Object.values(books);
    const book = booksArray.find((book) => book.isbn === isbn);
  if (book){
    res.send(book.reviews);
  } else {
    res.send("No such book with isbn: " + isbn);
  }
});

module.exports.general = public_users;
