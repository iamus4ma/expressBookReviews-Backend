const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username)
    if (!user || user.password !== password) {
        return false;
    }
    return true;
}

//only registered users can login
regd_users.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or passsword" });
    }
    const token = jwt.sign({ username }, "aVeryVerySecretkey");

    return res.status(200).json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
    const { isbn } = req.params;
    const { rating } = req.query;
    const { review } = req.session.username;

    if (!rating || !review) {
        return res.status(400).json({ message: "Rating and review are required" });
    }

    try {
        const bookIndex = books.findIndex(book => book.isbn === isbn);
        if (bookIndex === -1) {
            return res.status(404).json({ message: "Book not found" });
        }

        const existingReviewIndex = books[bookIndex].reviews.findIndex(r => r.username === req.session.username);

        if (existingReviewIndex !== -1) {
            // Update existing review
            books[bookIndex].reviews[existingReviewIndex] = { username: req.session.username, rating, review };
        } else {
            // Add new review
            books[bookIndex].reviews.push({ username: req.session.username, rating, review });
        }

        return res.status(200).json({ message: "Review added successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
    const { isbn } = req.params;
    const { username } = req.session;

    try {
        const bookIndex = books.findIndex(book => book.isbn === isbn);
        if (bookIndex === -1) {
            return res.status(404).json({ message: "Book not found" });
        }

        const reviewIndex = books[bookIndex].reviews.findIndex(review => review.username === username)
        if (reviewIndex === -1) {
            return res.status(404).json({ message: "Review not found" });
        }

        books[bookIndex].reviews.splice(reviewIndex, 1);
        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
