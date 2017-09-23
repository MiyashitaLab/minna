const express = require('express');
const multer = require('multer');
const libpath = require('path');
const fs = require('fs');

const upload = multer({ dest: libpath.join(__dirname, '../client/app/dst/assets') });
const app = express();

app.post('/upload', upload.single('music'), (req, res) => {
	const { file: { path, originalname } } = req;
	const ext = originalname.split('.').pop();

	fs.rename(path, libpath.resolve(libpath.dirname(path), `m${Date.now()}.${ext}`), (err) => {
		if (err) {
			console.error(err);
			res.sendStatus(500);
		}

		res.sendStatus(200);
	});
});

app.listen(3000);