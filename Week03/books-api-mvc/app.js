const express = require("express");
const bodyParser = require("body-parser");
const booksController = require("./controllers/booksController");
const validateBook = require("./middlewares/validateBook");
const logRequest = require("./middlewares/logRequest");

const app = express();

app.use(bodyParser.json()); // Parse incoming JSON data in request body
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// Define individual routes for each controller function
app.get("/books", logRequest, booksController.getAllBooks);
app.get("/books/:id", logRequest, booksController.getBookById);
app.post("/books", logRequest, validateBook, booksController.createBook); // Add validateBook before createBook
app.put("/books/:id", logRequest, validateBook, booksController.updateBook); // Add validateBook before updateBook
app.delete("/books/:id", logRequest, booksController.deleteBook);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
