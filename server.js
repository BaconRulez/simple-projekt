const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const socketIo = require('socket.io');

const server = http.createServer((req, res) => {
    // Handle static images
    if (req.url.startsWith('/img/')) {
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err, data) => {
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
            }[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        });
        return;
    }

    // Serve HTML files
    let filePath = './public' + req.url;
    if (req.url === '/') filePath = './public/login.html';

    if (req.url === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { username, password } = querystring.parse(body);
            if (username === 'user' && password === 'password') {
                res.writeHead(302, { Location: '/home' });
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1>Login failed</h1><p>Invalid username or password.</p>');
            }
        });
        return;
    }

    if (req.url === '/home') {
        filePath = './public/index.html';
    } else if (req.url === '/products') {
        filePath = './public/products.html';
    } else if (req.url === '/cart') {
        filePath = './public/cart.html';
    } else if(req.url === '/chat'){
        filePath = './public/chat.html';
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.html':
            contentType = 'text/html';
            break;
        case '.xml':
            contentType = 'application/xml';
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 Internal Server Error</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

const io = socketIo(server);
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('userJoined', (userData) => {
        connectedUsers.set(socket.id, {
            username: userData.username,
            profilePic: userData.profilePic
        });
        updateUserList();
    });

    socket.on('chatMessage', (msg) => {
        const user = connectedUsers.get(socket.id);
        io.emit('chatMessage', {
            ...msg,
            profilePic: user ? user.profilePic : null
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        connectedUsers.delete(socket.id);
        updateUserList();
    });

    function updateUserList() {
        const users = Array.from(connectedUsers.values());
        io.emit('userList', {
            count: users.length,
            users: users
        });
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});