const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/comments"
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: true,
})
app.use(express.json());

const connection = mongoose.connection
connection.once('open', () => {
    console.log("Database Connected");
})
const Comment = require("./models/comment");
app.post("/api/comments", (req, res) => {
    const comment = new Comment({
        username: req.body.username,
        comment: req.body.comment,
    })
    comment.save().then(response => {
        res.send(response);
    })
})
app.get('/api/comments', (req, res) => {
    Comment.find().then(comments => {
        res.send(comments);
    })
})
const server = app.listen(PORT, (req, res) => {
    console.log(`Listening on PORT  http://localhost:${PORT} ...`);

})
let io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log(`New Connection ${socket.id}`);
    // Recieve Event
    socket.on('comment', (data) => {
        console.log(data)
            //adding time to the data
        data.time = Date();
        socket.broadcast.emit('comment', data);
    })


    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);

    })
});