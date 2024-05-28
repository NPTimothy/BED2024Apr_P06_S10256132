const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
    constructor(id, username, email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    static async getAllUsers() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = "SELECT * FROM Users";

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new User(row.id, row.username, row.email)
        );
    }

    static async getUserById(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = "SELECT * FROM Users WHERE id = @id";

        const request = connection.request();
        request.input("id", id);

        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new User(
                  result.recordset[0].id,
                  result.recordset[0].username,
                  result.recordset[0].email
              )
            : null;
    }

    static async createUser(user) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `INSERT INTO Users (username, email) VALUES (@username, @email); SELECT SCOPE_IDENTITY AS id`;

        const request = connection.request();
        request.input("username", user.username);
        request.input("email", user.email);

        const result = await request.query(sqlQuery);

        connection.close();

        // Retrieve the newly created user using ID
        return this.getUserById(result.recordset[0].id);
    }

    static async updateUser(id, user) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Users SET username = @username, email = @email WHERE id = @id`;

        const request = connection.request();
        request.input("username", user.username);
        request.input("email", email);

        const result = await request.query(sqlQuery);

        connection.close();

        return this.getUserById(id);
    }

    static async deleteUser(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = "DELETE FROM Users WHERE id = @id";

        const request = connection.request();
        request.input("id", id);

        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowAffected > 0;
    }

    static async searchUsers(searchTerm) {
        const connection = await sql.connect(dbConfig);

        try {
            const query = `SELECT * FROM Users WHERE username LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`;

            const result = await connection.request().query(query);
            return result.recordset;
        } catch (error) {
            throw new Error("Error searching users"); // Or handle error differently
        } finally {
            await connection.close();
        }
    }

    static async getUsersWithBooks() {
        const connection = await sql.connect(dbConfig);

        try {
            const query = `SELECT u.id AS user_id, u.username, u.email, b.id AS book_id, b.title, b.author FROM Users u LEFT JOIN UserBooks ub ON ub.user_id = u.id LEFT JOIN Books b ON ub.book_id = b.id ORDER BY u.username;`;

            const result = await connection.request().query(query);

            const usersWithBooks = {};
            for (const row of result.recordset) {
                const userId = row.user_id;
                if (!usersWithBooks[userId]) {
                    usersWithBooks[userId] = {
                        id: userId,
                        username: row.username,
                        email: row.email,
                        books: [],
                    };
                }
                usersWithBooks[userId].books.push({
                    id: row.book_id,
                    title: row.title,
                    author: row.author,
                });
            }
            return Object.values(usersWithBooks);
        } catch (error) {
            console.error(error);
            throw new Error("Error fetching users with books");
        } finally {
            await connection.close();
        }
    }
}

module.exports = User;
