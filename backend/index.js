require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const { neon } = require('@neondatabase/serverless');

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://communique-task-frontend.vercel.app",
    "https://communiqueclient.netlify.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Neon connection
const sql = neon(process.env.DATABASE_URL);


// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}


app.get('/api/candidates/export/csv', async (req, res) => {
  try {
    const candidates = await sql`SELECT * FROM candidates ORDER BY id DESC`;
    const fields = ['name', 'roll_number', 'google_drive_link'];
    const parser = new Parser({ fields });
    const csv = parser.parse(candidates);

    res.header('Content-Type', 'text/csv');
    res.attachment('candidates.csv');
    res.send(csv);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/candidates/export/pdf' , async (req, res) => {
  try {
    const candidates = await sql`SELECT * FROM candidates ORDER BY id DESC`;
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=candidates.pdf');
    doc.pipe(res);

    doc.fontSize(16).text('Candidate List', { align: 'center' });
    doc.moveDown();

    candidates.forEach(c => {
      doc.fontSize(12).text(`Name: ${c.name}`);
      doc.text(`Roll Number: ${c.roll_number}`);
      doc.text(`Google Drive Link: ${c.google_drive_link}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// User Registration
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({ error: 'Username, password, and email required' });

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check for existing username or email
    const existing = await sql`
      SELECT username, email FROM users WHERE username = ${username} OR email = ${email}
    `;
    if (existing.length > 0) {
      if (existing[0].username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (existing[0].email === email) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO users (username, password_hash, email)
      VALUES (${username}, ${hash}, ${email})
    `;
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  //console.log(req.body);
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  try {
    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (users.length === 0)
     {//console.log("user is invalid")
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    //console.log(user);
    const valid = await bcrypt.compare(password, user.password_hash);
    //console.log(valid);

    if (!valid)
      {//console.log("not valid");
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    //console.log(token);
    res.json({ token });
  } catch (err) {
    //console.log(".");
    res.status(500).json({ error: err.message });
  }
});

// Protected: View All Candidates
app.get('/api/candidates', authenticateToken, async (req, res) => {
  try {
    const candidates = await sql`SELECT * FROM candidates ORDER BY id DESC`;
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a Candidate (public or protected as needed)
app.post('/api/candidates', async (req, res) => {
  const { name, roll_number, google_drive_link } = req.body;
  if (!name || !roll_number || !google_drive_link)
    return res.status(400).json({ error: 'All fields required' });

  // --- Add validation here ---
  const nameRegex = /^[A-Za-z\s]+$/;
  const rollRegex = /^\d{2}[A-Z]{2}\d{5}$/; // e.g., 24CS10081
  const driveRegex = /^https:\/\/drive\.google\.com\//;

  if (!nameRegex.test(name)) {
    return res.status(400).json({ error: 'Name must contain only alphabets and spaces.' });
  }
  if (!rollRegex.test(roll_number)) {
    return res.status(400).json({ error: 'Roll number must be in the format 24CS10081 (2 digits, 2 uppercase letters, 5 digits).' });
  }
  if (!driveRegex.test(google_drive_link)) {
    return res.status(400).json({ error: "Google Drive link must be a valid write link." });
  }
  // --- End validation ---

  try {
    const result = await sql`
      INSERT INTO candidates (name, roll_number, google_drive_link)
      VALUES (${name}, ${roll_number}, ${google_drive_link})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/', (req,res)=>{
  
    res.json({
    databaseUrl: process.env.DATABASE_URL ? "Set" : "Not Set",
    jwtSecret: process.env.JWT_SECRET ? "Set" : "Not Set"
  });
  
})

app.listen(5001, () => console.log('Server running on port 5001'));
