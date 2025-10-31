const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{     // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}



const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}




//only registered users can login
regd_users.post("/login", (req,res) => {    
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});





// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // 1. Check if user is logged in
    if (!req.session.authorization) {
        return res.status(401).send('You are not logged in.');
    }

    // 2. Get data from the request
    const isbn = req.params.isbn;
    const reviewText = req.body.review;
    
    // --- UPDATED ---
    // Get the username from the session
    const username = req.session.authorization.username;

    // 3. Find the book
    const booksArray = Object.values(books);
    const book = booksArray.find((book) => book.isbn === isbn);

    // 4. Check if the book was found
    if (!book) {
        return res.status(404).send(`No such book with isbn: ${isbn}`);
    }

    // 5. Add or update the review using the username as the key
    
    // --- UPDATED ---
    // Check if the user already has a review for this book
    const existingReview = book.reviews[username];

    if (existingReview) {
        // Update the existing review
        book.reviews[username] = reviewText;
        res.send(`Your review for "${book.title}" (user: ${username}) has been updated.`);
    } else {
        // Add a new review
        book.reviews[username] = reviewText;
        res.send(`Your review for "${book.title}" (user: ${username}) has been added.`);
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
