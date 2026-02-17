const express = require("express");
const http = require("http");
const multer = require("multer");
const { Server } = require("socket.io");
const { User } = require("./objects/User")
const { default: utils } = require("./utils");
const fs = require('fs')
utils.fs = fs;

const clientIps = []
const clientObjects = {}
const sockets = []

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"))

if (!fs.existsSync('messages/all.json')) {
  fs.writeFileSync('messages/all.json','{"permitted_ips":[], "banned_ips":[],"messages":[]}')
}

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.filename}`,
  });
});

app.get('/users', (req,res) => {
  res.json(clientIps)
})

app.get('/messages', (req,res) => {
    const chat = req.query.chat
    const chatObject = utils.ReadJSON(`messages/${chat}.json`)
    if (utils.CheckUserPermitted(req.ip,chatObject)) res.json(chatObject)
})

io.on("connection", (socket) => {
  const clientIp = socket.handshake.address;
  socket.ip = clientIp
  if (!clientIps.find((clientIp) => clientIp == clientIp)) {
    clientObjects[clientIp] = new User(clientIp)
  }
  clientIps.push(clientIp)
  
  socket.on("set username", (username) => {
    socket.username = username;
  });

  socket.on("msg_send", (data) => {
    const chatObject = utils.ReadJSON(`messages/${data.chat}.json`)
    if (!utils.CheckUserPermitted(clientIp,chatObject)) return
    if ((data.message && data.message.length > 0) || (data.files && data.files.length > 0)) {
      const msg = {
        username: socket.username || "None",
        ip: clientIp,
        message: data.message.replaceAll(/\n+/g, '\n') || "",
        files: data.files || [],
        chat: data.chat,
      }

      io.emit("msg_send", msg)
      const chat = data.chat
      const chatFileDir = `messages/${chat}.json`
      const chatMessage = utils.ReadJSON(chatFileDir)
      chatMessage.messages.push(msg)
      fs.writeFileSync(chatFileDir,`${JSON.stringify(chatMessage,null,2)}`)
    }
  });

  socket.on("set username", (username) => {
    socket.username = username;
  });

  socket.on("disconnect", () => {
    clientIps.splice(clientIps.indexOf(clientIp),1)
    if (!clientIps.find((clientIp) => clientIp == clientIp)) {
      delete clientObjects[clientIp]
      console.log(`User ${clientIp} Disconnected.`);
    }
  });
  
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});