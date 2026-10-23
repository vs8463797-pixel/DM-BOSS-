const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Setup SQLite Database
const db = new sqlite3.Database('./lottery.db', (err) => {
    if (err) {
        console.error('Database opening error: ' + err.message);
    } else {
        console.log('Connected to SQLite Database.');
        db.run(`CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state_name TEXT,
            draw_name TEXT,
            prize_number TEXT,
            draw_time TEXT,
            date TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM results`, (err, row) => {
                if (row.count === 0) {
                    db.run(`INSERT INTO results (state_name, draw_name, prize_number, draw_time, date) VALUES 
                        ('Nagalad State Lottery', 'DEAR SUNNY MORNING', '85A 43210', '1:00 PM', '2026-10-23'),
                        ('Kerala State Lottery', 'STREE SHAKTI (SS-390)', 'SB 987654', '3:00 PM', '2026-10-23')`);
                }
            });
        });
    }
});

// API: Get all results
app.get('/api/results', (req, res) => {
    db.all(`SELECT * FROM results ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: rows });
    });
});

// API: Admin Manual Update
app.post('/api/update-result', (req, res) => {
    const { state_name, draw_name, prize_number, draw_time, date } = req.body;
    const query = `INSERT INTO results (state_name, draw_name, prize_number, draw_time, date) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [state_name, draw_name, prize_number, draw_time, date], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Success", id: this.lastID });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
