const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const server = require("http").createServer(app);
const io = require('socket.io')(server, {
    cors: { 
        origin: '*',
    },
    methods: ["GET", "POST"]
});
const connectDB = require("./config/dbConfig");
const Document = require("./model/Document");

app.use(cors());

connectDB();

io.on('connection', socket => {

    socket.on('get-document', async (documentId) => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        }) 

        socket.on('save-document', async data => {
            await Document.findByIdAndUpdate(documentId, {data});
        })
    });
});

async function findOrCreateDocument(id) {
    if(id == null) return;

    const document = await Document.findById(id);
    if(document) return document;

    return await Document.create({_id: id, data: ""});
}

server.listen(3000, () => {
    console.log("listening on port 3000");
})


