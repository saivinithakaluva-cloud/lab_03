# Lab 03: SQLite Database and Advanced CRUD Operations

## 1. Student Details

- **Name:** SAIVINITHA KALUVA
- **Registration Number:** 252U1R9054
- **Section:** GEN AI-2A
- **Course:** Backend Development Fundamentals
- **Faculty:** Joel Prashanth D
- **Lab Number:** 03

## 2. Project Overview

The Books Management API is developed using Node.js, Express.js, and SQLite. This project performs CRUD operations (Create, Read, Update, and Delete) to manage book records efficiently. It also provides advanced features such as searching, sorting, filtering, and pagination.

## 3. Technologies Used

- Node.js
- Express.js
- SQLite
- JavaScript
- Postman

## 4. Database Structure

**Database Name:** books.db

**Table Name:** book

The book table contains the following columns:

- id – Unique ID of each book
- title – Name of the book
- author – Name of the author
- price – Price of the book
- pages – Number of pages

## 5. API Endpoints

- **GET /books** – Retrieves all books.
- **GET /books/:id** – Retrieves a particular book using its ID.
- **POST /books** – Adds a new book to the database.
- **PUT /books/:id** – Updates the details of an existing book.
- **DELETE /books/:id** – Deletes a book using its ID.

## 6. Advanced Features

- Search books by title or author.
- Sort books using different fields.
- Filter books based on minimum and maximum price.
- Implement pagination using limit and offset.
- Validate user input before inserting or updating records.
- Handle errors and return appropriate HTTP status codes.
- Automatically insert 10 sample books when the database is empty.

## 7. Sample POST Request

**URL:** http://localhost:3000/books

**Method:** POST

**Request Body:**

```json
{
  "title": "Learning Node.js",
  "author": "John Smith",
  "price": 450,
  "pages": 300
}
```

## 8. Running the Project

1. Open the project folder in VS Code.
2. Install the required dependencies using `npm install`.
3. Start the server using `node server.js`.
4. Open Postman.
5. Test the API endpoints using `http://localhost:3000/books`.

## 9. Testing

The Books Management API was tested using Postman. All CRUD operations, including adding, retrieving, updating, and deleting books, were tested. Search, sorting, filtering, and pagination features were also implemented.

## 10. Conclusion

This lab helped me understand how to create REST APIs using Node.js, Express.js, and SQLite. I learned how to perform CRUD operations, manage database records, validate user inputs, implement advanced API features, and test endpoints using Postman.