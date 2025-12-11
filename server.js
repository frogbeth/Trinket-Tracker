const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
require('dotenv').config();

// mysql local server connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// get all trinkets to display on index.html
app.get('/trinkets', (req, res) => {
  const query = `SELECT trinketId, trinketName, trinketBrand, trinketColor, trinketSeries, trinketRelease, trinketUrl
    FROM trinkets`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching trinkets:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// create new user record in database on signup.html
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }
  const query = 'INSERT INTO appUsers (username, password, permissions) VALUES (?, ?, ?)';
  db.query(query, [username, password, 'user'], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Account created successfully!', userId: result.insertId });
  });
});

// check login input and check with database on login.html
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }
  const query = 'SELECT userId, username, permissions FROM appUsers WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length > 0) {
      res.json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});

// view user profile info on profile.html
app.get('/profile/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT username, bioMessage, permissions FROM appUsers WHERE userId = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Profile fetch error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// view user collection on profile.html
app.get('/profile/:userId/collection', (req, res) => {
  const { userId } = req.params;
  const query = `SELECT ut.collectId, t.trinketId, t.trinketName, t.trinketBrand, t.trinketColor, t.trinketSeries, t.trinketRelease, t.trinketUrl
    FROM usertrinkets ut
    JOIN trinkets t ON ut.trinketId = t.trinketId
    WHERE ut.userId = ?
    ORDER BY ut.collectId DESC`;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user collection:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// update user bio from profile.html
app.put('/profile/:id', (req, res) => {
  const userId = req.params.id;
  const { bioMessage } = req.body;
  const query = 'UPDATE appUsers SET bioMessage = ? WHERE userId = ?';
  db.query(query, [bioMessage, userId], (err, result) => {
    if (err) {
      console.error('Bio update error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Bio updated successfully' });
  });
});

// get community posts to display on community.html
app.get('/posts', (req, res) => {
  const query = `SELECT p.postId, p.postText, p.trinketId, p.userId, p.imageUrl, p.postDate, u.username
    FROM communityposts p
    JOIN appUsers u ON p.userId = u.userId
    ORDER BY p.postId DESC`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// create post from community.html
app.post('/posts', (req, res) => {
  const { userId, trinketId, postText, imageUrl } = req.body;
  if (!userId || !trinketId || !postText) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const query = `INSERT INTO communityposts (userId, trinketId, postText, imageUrl, postDate)
    VALUES (?, ?, ?, ?, NOW())`;
  db.query(query, [userId, trinketId, postText, imageUrl || null], (err, result) => {
    if (err) {
      console.error('Error creating post:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Post created successfully', postId: result.insertId, postDate: new Date() });
  });
});

// add trinket to user collection from index.html
app.post('/usertrinkets', (req, res) => {
  const { userId, trinketId } = req.body;
  if (!userId || !trinketId) {
    return res.status(400).json({ message: 'Missing userId or trinketId' });
  }
  const query = 'INSERT INTO usertrinkets (userId, trinketId) VALUES (?, ?)';
  db.query(query, [userId, trinketId], (err, result) => {
    if (err) {
      console.error('Error adding trinket:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Trinket added successfully', collectId: result.insertId });
  });
});

// add new trinket from index.html (admin only)
app.post('/trinkets', (req, res) => {
  const { userId, trinketName, trinketBrand, trinketColor, trinketSeries, trinketRelease, trinketUrl } = req.body;

  if (!userId || !trinketName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const checkQuery = 'SELECT permissions FROM appUsers WHERE userId = ?';
  db.query(checkQuery, [userId], (err, results) => {
    if (err) {
      console.error('Permission check error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0 || results[0].permissions !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const releaseValue = trinketRelease && trinketRelease.trim() !== '' ? trinketRelease : null;
    const insertQuery = `
      INSERT INTO trinkets (trinketName, trinketBrand, trinketColor, trinketSeries, trinketRelease, trinketUrl)
      VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(insertQuery, [trinketName, trinketBrand, trinketColor, trinketSeries, releaseValue, trinketUrl], (err, result) => {
      if (err) {
        console.error('Error adding trinket:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      res.json({ message: 'Trinket added successfully', trinketId: result.insertId });
    });
  });
});

//get trinket count to display on profile.html
app.get('/profile/:userId/count', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.promise().query(
      'SELECT COUNT(*) AS trinketCount FROM usertrinkets WHERE userId = ?',
      [userId]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching trinket count:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// remove trinket from user's collection on profile.html
app.delete('/usertrinkets/:collectId', (req, res) => {
  const { collectId } = req.params;
  const query = 'DELETE FROM usertrinkets WHERE collectId = ?';
  db.query(query, [collectId], (err, result) => {
    if (err) {
      console.error('Error removing trinket:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Trinket not found in collection' });
    }
    res.json({ message: 'Trinket removed successfully' });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));