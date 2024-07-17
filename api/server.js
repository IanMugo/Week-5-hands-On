const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

app.use(express.json())
app.use(cors())
dotenv.config()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

db.connect((error) => {
    if (err) return console.log("Error connecting to MYSQL")

    console.log("connected to MYSQL:", db.threadid);

    db.query(`CREATE DATABASE IF NOT EXISTS expense_tracker`, (err, result) => {
        if(err) return console.log(err)

            console.log("database expense_tracker created/checked")

            //select our database
            db.changeUser({database: "expense_tracker"}, (err) => {
                if(err) return console.log(err)

                    console.log("changed to expense_tracker")
            
                
                        // create users tables
                        const createuserstable = `
                        CREATE TABLE IF NOT EXISTS users (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            email VARCHAR(100) NOT NULL UNIQUE,
                            username VARCHAR(50) NOT NULL,
                            password VARCHAR(255) NOT NULL
                        )
                        `;
            
                    db.query(createusersTable, (err, result) =>{
                        if(err) returnconsole.log(err)
            
                        console.log("users table checked/created")
                    })

            })


    })
})

// user registration route 
// app.get('')
// app.put('')
// app.delete('')
app.post('/api/register', async (req, res) => {
    try {
      const usersQuery = 'SELECT * FROM users WHERE email = ?';
  
      db.query(usersQuery, [req.body.email], (err, data) => {
        if (err) {
          return res.status(500).json("Error checking user");
        }
        if (data.length) {
          return res.status(409).json("User already exists");
        }
  
        const createUserQuery = `INSERT INTO users(email, username, password) VALUES (?)`;
        const values = [
          req.body.email,
          req.body.username,
          req.body.password,
        ];
  
        // Insert user in db
        db.query(createUserQuery, [values], (err, data) => {
          if (err) {
            return res.status(500).json("Something went wrong");
          }
          return res.status(200).json("User created successfully");
        });
      });
  
    } catch (err) {
      res.status(500).json("Internal server error");
    }
  });
  
//user login route
app.post('/api/login', async(req, res) =>{
    try{
        const users = `SELECT * FROM users WHERE email = ?`
        
        db.query(users, [req.body.email], (err,data =>{
            if(data.lemgth === 0) return res.status(404).json("user not found")

            //check if password is valid
            const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password)

            if(!isPasswordValid) return res.status(404).json("invalid email or password")

                return res.status(200).json("login successful")
        }))
    }
})

app.listen(3000, () =>{
    console.log("server is running on PORT 3000")
})