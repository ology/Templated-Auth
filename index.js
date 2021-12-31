const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite = require('sqlite3').verbose();

const app = express();
const router = express.Router();

// use the environment variable first
const port = process.env.PORT || '3333';

// use a static directory
app.use(express.static(path.join(__dirname, 'public')));

// set the pug views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({ extended: true }));

let sess; // global session for demo purposes

const db = new sqlite.Database('auth.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to sqlite');
});

router.get('/', (req, res) => {
    sess = req.session;
    if (sess.username) {
        return res.redirect('/admin');
    }
    res.render('index', { title: 'Login'});
});

router.get('/login', (req, res) => {
    res.redirect('/');
});
router.post('/login', (req, res) => {
    sess = req.session;
    validateUser(req.body.username, (data) => {
        console.log("Data:", data);
        sess.username = data;
        res.redirect('/admin');
    });
});

function validateUser(who, callback) {
        const sql = 'SELECT * FROM user WHERE username = ?';
        db.get(sql, [who], (err, row) => {
            if (err) {
                console.log(err);
            }
            else {
                callback(row.username);
            }
        });
}

router.get('/admin', (req, res) => {
    sess = req.session;
    if (sess.username) {
        res.write(`<b>Hello ${sess.username}</b> | <a href="/logout">Logout</a>`);
        res.end();
    }
    else {
        res.redirect('/');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});

app.use('/', router);

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}/`);
});
