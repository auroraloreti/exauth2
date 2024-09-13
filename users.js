const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); 
require('dotenv').config(); 

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

 
  const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (userExists.rows.length > 0) {
    return res.status(400).json({ error: 'Username is already taken' });
  }

  try {
   
    const hashedPassword = await bcrypt.hash(password, 10);
    
 
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    res.status(201).json({ msg: 'Signup successful. Now you can log in.' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
 
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const userData = user.rows[0];

  
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    
    const payload = {
      id: userData.id,
      username: userData.username,
    };

    
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });

   
    await pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, userData.id]);

   
    res.json({
      token,
      id: userData.id,
      username: userData.username,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;