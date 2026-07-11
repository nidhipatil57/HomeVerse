"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.broadcastUpdate = broadcastUpdate;
const socket_io_1 = require("socket.io");
let io = null;
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });
    io.on("connection", (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        socket.on("join-room", (roomName) => {
            socket.join(roomName);
            console.log(`👤 Socket ${socket.id} joined room: ${roomName}`);
        });
        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
    return io;
}
function broadcastUpdate(event, payload) {
    if (io) {
        io.emit(event, payload);
    }
}
