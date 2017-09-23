const express = require('express');
const multer = require('multer');
const libpath = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const io = require('socket.io')(app.listen(8000));
const upload = multer({ dest: libpath.join(__dirname, '../client/app/dst/assets') });

let volume = 0.5;

app.use(cors());
app.use('/', express.static(libpath.join(__dirname, 'dst/')));

app.post('/upload', upload.single('music'), (req, res) => {
	const { file: { path, originalname } } = req;
	const ext = libpath.extname(originalname);

	fs.rename(path, libpath.resolve(libpath.dirname(path), `m${Date.now()}${ext}`), (err) => {
		if (err) {
			console.error(err);
			res.sendStatus(500);
		}

		res.sendStatus(200);
	});
});

io.on('connection', (client) => {
	client.emit('hello', { volume });
	client.on('from:volume', ({ volume: next }) => {
		volume = next;
		io.emit('to:volume', { volume });
	});
});