const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
// Import layanan profanity filter
const { checkMessage, checkAPIStatus } = require("./utils/profanityService");
// Setting untuk menunjukkan pesan yang diblokir ke admin
const SHOW_BLOCKED_MESSAGES_TO_ADMIN = true;

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Cek status API saat server dimulai
(async function () {
  const status = await checkAPIStatus();
  console.log("Status API Profanity Filter:", status);
})();

// Run when client connect
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome user
    socket.emit("message", formatMessage("system", "Welcome to Chatty!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("system", `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("system", `${user.username} has left the chat`)
      );
    }
  });

  // Listen for chatMessage
  socket.on("chatMessage", async (msg) => {
    const user = getCurrentUser(socket.id);

    try {
      // Periksa pesan menggunakan API Python
      const result = await checkMessage(msg);

      if (result.isProfane) {
        // Jika pesan mengandung kata kasar, kirim peringatan hanya ke pengirim
        socket.emit(
          "message",
          formatMessage(
            "system",
            "Pesan Anda mengandung kata kasar dan tidak dikirimkan."
          )
        );

        // Kirim log ke admin jika fitur diaktifkan
        if (SHOW_BLOCKED_MESSAGES_TO_ADMIN) {
          // Kirim pesan tersensor ke admin (jika ada) di room yang sama
          const adminMessage = formatMessage(
            "system",
            `[BLOCKED] User ${user.username} mencoba mengirim pesan yang mengandung kata kasar: "${msg}"`
          );

          // Cari pengguna yang merupakan admin di room yang sama
          const admins = getRoomUsers(user.room).filter((u) => u.isAdmin);
          admins.forEach((admin) => {
            io.to(admin.id).emit("message", adminMessage);
          });
        }

        // Log konsol untuk debugging
        console.log(
          `[BLOCKED MESSAGE] User: ${user.username}, Room: ${user.room}, Message: "${msg}", Confidence: ${result.confidence}`
        );
      } else {
        // Jika pesan bersih, kirim ke semua user di room
        io.to(user.room).emit(
          "message",
          formatMessage(`${user.username}`, msg)
        );
      }
    } catch (error) {
      // Jika terjadi error dengan API, tetap kirim pesan (failsafe)
      console.error("Error saat memeriksa pesan:", error);
      io.to(user.room).emit("message", formatMessage(`${user.username}`, msg));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
