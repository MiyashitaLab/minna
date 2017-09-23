const express = require('express');
const multer = require('multer');
const libpath = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const io = require('socket.io')(app.listen(8000));
const upload = multer({ dest: libpath.join(__dirname, '../client/app/dst/assets') });

const files = [];
let volume = 0.5;
let index = -1;

app.use(cors());
app.use('/', express.static(libpath.join(__dirname, 'dst/')));

app.post('/upload', upload.single('music'), (req, res) => {
	const { file: { path, originalname } } = req;
	const ext = libpath.extname(originalname);
	const nextPath = libpath.join(libpath.dirname(path), `m${Date.now()}${ext}`);

	fs.rename(path, nextPath, (err) => {
		if (err) {
			console.error(err);
			res.sendStatus(500);
		}

		files.push(nextPath);
		io.emit('server/update:files', { files });
		res.sendStatus(200);
	});
});

io.on('connection', (client) => {
	client.emit('server/hello', { volume, files, index });
	client.on('client/update:volume', ({ volume: next }) => {
		volume = next;
		io.emit('server/update:volume', { volume });
	});
	client.on('client/update:index', ({ index: next }) => {
		index = next;
	});
});