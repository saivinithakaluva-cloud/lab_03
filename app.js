

const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
const PORT = 3000;

app.use(express.json());

let db;

// Connect to SQLite database
async function connectDB() {
    db = await open({
        filename: "./books.db",
        driver: sqlite3.Database
    });

    // Create books table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS book (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price INTEGER,
            pages INTEGER
        )
    `);

    // Insert sample books if table is empty
    const count = await db.get(
        "SELECT COUNT(*) AS count FROM book"
    );

    if (count.count === 0) {
        await db.run(`
            INSERT INTO book (title, author, price, pages) VALUES
            ('Wings of Fire', 'A.P.J. Abdul Kalam', 350, 180),
            ('The Alchemist', 'Paulo Coelho', 250, 208),
            ('Atomic Habits', 'James Clear', 450, 320),
            ('Rich Dad Poor Dad', 'Robert Kiyosaki', 300, 336),
            ('Harry Potter', 'J.K. Rowling', 500, 400),
            ('The Power of Now', 'Eckhart Tolle', 280, 236),
            ('Think Like a Monk', 'Jay Shetty', 400, 280),
            ('Deep Work', 'Cal Newport', 350, 296),
            ('Ikigai', 'Hector Garcia', 270, 208),
            ('The Psychology of Money', 'Morgan Housel', 320, 256)
        `);
    }

    console.log("Database connected successfully");
}

// GET all books with search, sorting and filtering
app.get("/books", async (req, res) => {
    try {
        const {
            search_q = "",
            order_by = "id",
            order = "ASC",
            limit = 10,
            offset = 0,
            min_price,
            max_price
        } = req.query;

        // Validate sorting column
        const allowedColumns = [
            "id", "title", "author", "price", "pages"
        ];

        if (!allowedColumns.includes(order_by)) {
            return res.status(400).json({
                message: "Invalid order_by column"
            });
        }

        // Validate sorting order
        const sortOrder = order.toUpperCase();

        if (!["ASC", "DESC"].includes(sortOrder)) {
            return res.status(400).json({
                message: "Order must be ASC or DESC"
            });
        }

        // Validate pagination
        const pageLimit = Number(limit);
        const pageOffset = Number(offset);

        if (
            !Number.isInteger(pageLimit) || pageLimit <= 0 ||
            !Number.isInteger(pageOffset) || pageOffset < 0
        ) {
            return res.status(400).json({
                message: "Invalid limit or offset"
            });
        }

        let sql = "SELECT * FROM book WHERE title LIKE ?";
        let params = [`%${search_q}%`];

        // Minimum price filter
        if (min_price !== undefined) {
            const min = Number(min_price);

            if (!Number.isFinite(min)) {
                return res.status(400).json({
                    message: "Invalid minimum price"
                });
            }

            sql += " AND price >= ?";
            params.push(min);
        }

        // Maximum price filter
        if (max_price !== undefined) {
            const max = Number(max_price);

            if (!Number.isFinite(max)) {
                return res.status(400).json({
                    message: "Invalid maximum price"
                });
            }

            sql += " AND price <= ?";
            params.push(max);
        }

        if (
            min_price !== undefined &&
            max_price !== undefined &&
            Number(min_price) > Number(max_price)
        ) {
            return res.status(400).json({
                message: "Minimum price cannot exceed maximum price"
            });
        }

        sql += ` ORDER BY ${order_by} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(pageLimit, pageOffset);

        const books = await db.all(sql, params);

        res.status(200).json({
            message: "Books retrieved successfully",
            books: books
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// GET a single book by ID
app.get("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [id]
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book retrieved successfully",
            book: book
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// POST - Add a new book
app.post("/books", async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            price === undefined || price === null ||
            price === "" || !Number.isFinite(Number(price)) ||
            (pages !== undefined &&
                (!Number.isInteger(Number(pages)) ||
                 Number(pages) <= 0))
        ) {
            return res.status(400).json({
                message: "Valid title, author, price and pages are required"
            });
        }

        const result = await db.run(
            `INSERT INTO book (title, author, price, pages)
             VALUES (?, ?, ?, ?)`,
            [
                title.trim(),
                author.trim(),
                Number(price),
                pages === undefined ? null : Number(pages)
            ]
        );

        res.status(201).json({
            message: "Book created successfully",
            bookId: result.lastID
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// PUT - Update an existing book
app.put("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, author, price, pages } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        if (
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            price === undefined || price === null ||
            price === "" || !Number.isFinite(Number(price)) ||
            (pages !== undefined &&
                (!Number.isInteger(Number(pages)) ||
                 Number(pages) <= 0))
        ) {
            return res.status(400).json({
                message: "Valid title, author, price and pages are required"
            });
        }

        const result = await db.run(
            `UPDATE book
             SET title = ?, author = ?, price = ?, pages = ?
             WHERE id = ?`,
            [
                title.trim(),
                author.trim(),
                Number(price),
                pages === undefined ? null : Number(pages),
                id
            ]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// DELETE - Delete a book
app.delete("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const result = await db.run(
            "DELETE FROM book WHERE id = ?",
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// Start server after connecting database
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

startServer();
