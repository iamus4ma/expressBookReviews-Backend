const express = require('express');
const public_users = express.Router();
const { isValid, users } = require("./auth_users.js");
const books = require("./booksdb.js");

// Register a new user asynchronously
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    isValid(username)
        .then((isValidUser) => {
            if (isValidUser) {
                return res.status(409).json({ message: "Username already exists" });
            } else {
                users.push({ username, password });
                return res.status(200).json({ message: "User registered successfully" });
            }
        })
        .catch((err) => {
            console.error("Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/books');
        return res.status(200).json({ books: response.data.books });
    } catch (error) {
        console.error("Error:", error.response.data);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const response = await axios.get(`http://localhost:3000/books/isbn/${isbn}`);
        return res.status(200).json({ book: response.data.book });
    } catch (error) {
        console.error("Error:", error.response.data);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const { author } = req.params;
        const response = await axios.get(`http://localhost:3000/books/author/${author}`);
        return res.status(200).json({ booksByAuthor: response.data.booksByAuthor });
    } catch (error) {
        console.error("Error:", error.response.data);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const { title } = req.params;
        const response = await axios.get(`http://localhost:3000/books/title/${title}`);
        return res.status(200).json({ booksByTitle: response.data.booksByTitle });
    } catch (error) {
        console.error("Error:", error.response.data);
        return res.status(500).json({ message: "Internal server error" });
    }
});


//  Get book review asynchronously
public_users.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;

    const bookPromise = new Promise((resolve, reject) => {
        const book = books.find(book => book.isbn === isbn)
        if (book) {
            resolve(book.reviews || []);
        } else {
            reject({ message: "Book not found" });
        }
    });

    bookPromise
        .then((reviews) => {
            return res.status(200).json({ reviews });
        })
        .catch((err) => {
            return res.status(400).json(err);
        });
});

module.exports.general = public_users;
