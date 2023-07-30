import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("verifiy", (roomName, done) => {
        const room = wsServer.sockets.adapter.rooms.get(roomName);
        const roomSize = room ? room.size : 0;
        if (roomSize >= 2) {
            done("FULL");
        } else {
            done("OK");
        }
    });
    socket.on("join_room", (roomName, nickName) => {
        socket.join(roomName);
        socket["nickName"] = nickName;
        socket.to(roomName).emit("welcome", socket.nickName);
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer, socket.nickName);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
            socket.to(room).emit("bye", socket.nickName);
        });
    });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
