// get all the require modules
const path = require('path');
const bodyParser = require('body-parser');
const searchYoutube = require('youtube-api-v3-search');
const express = require('express');
const app = express();

app.use('/assets', express.static(__dirname + '/assets'));
app.use(bodyParser.urlencoded({extended: false}));

// render the html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/", (req, res) => {
    const options = {
        q: req.body.query,
        part:'snippet',
        type:'video',
        maxResults: 50
    };

    // get the query result using youtube rest api.
    searchYoutube(process.env.YOUTUBE_API_KEY, options, (error, result) => {
        if(error)
        {
            console.log(error);
        }
        else
        {
            res.send(result);
        }
    });
});

app.listen(process.env.PORT || 3000);


