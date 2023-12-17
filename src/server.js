const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/forward', async function (req, res) {
    const url = decodeURIComponent(req.query.url);
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.listen(8080, function () {
    console.log('CORS-enabled web server listening on port 8080.')
});