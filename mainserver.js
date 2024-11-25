// Integrated Server: integratedServer.js
const express = require('express');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load and parse XML file for user management
function loadUsers(callback) {
    fs.readFile('users.xml', (err, data) => {
        if (err) {
            return callback(err);
        }
        xml2js.parseString(data, (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result.users.user);
        });
    });
}

// Save users back to XML file
function saveUsers(users, callback) {
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({ users: { user: users } });
    fs.writeFile('users.xml', xml, (err) => {
        callback(err);
    });
}

// Login endpoint
app.post('/login', (req, res) => {
    const { userid, password } = req.body;
    loadUsers((err, users) => {
        if (err) {
            return res.status(500).send('Error reading user data');
        }
        const loggedIn = users.some(user => user.userid[0] === userid && user.password[0] === password);
        res.json({ loggedin: loggedIn });
    });
});

// Signup endpoint
app.post('/signup', (req, res) => {
    const { userid, password } = req.body;
    loadUsers((err, users) => {
        if (err) {
            return res.status(500).send('Error reading user data');
        }
        
        const userExists = users.some(user => user.userid[0] === userid);
        if (userExists) {
            return res.status(400).json({ message: 'User  already exists' });
        }

        users.push({ userid: [userid], password: [password] });
        saveUsers(users, (err) => {
            if (err) {
                return res.status(500).send('Error saving user data');
            }
            res.json({ message: 'User  registered successfully' });
        });
    });
});

// Chatbot API integration
const API_KEY = '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';
const MODEL_NAME = 'facebook/blenderbot-1B-distill';

app.post('/get_response', async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
            { inputs: message },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ response: response.data[0].generated_text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});