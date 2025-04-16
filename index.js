//reason behind this project: as iiitn's students communicate usually 
// on the common IIITN whatsapp group with 1000+ members,
//and if any junior wants to communicate the senior, then it is quite difficult
//as although our mailBox is always full with emails of 
// several buisness,frauds,multiple college fests,hackathons,
//  internships, certifications,faculty notices, assignments ,
//  lab Tasks, and much more , other from genuine emails 
// to overcome this, we are introducing a platform where, 
// only iiitN students can communicate personally,
// no public groups are designes as such for now,
//With this, each student can communicate with each other senior/junior effectivelly

const http=require("http");
const express=require("express");
const app =express();
const server=http.createServer(app);
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine","ejs");
const path=require("path");
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")));
const mongoose = require('mongoose');
main().then((res)=>{
console.log("MongoDB Connection Established.")
})
.catch(err => console.log(err));
// Updated connection code
async function main() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wispr';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    console.log('MongoDB connected to:', mongoose.connection.host);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Implement retry logic or fallback
    process.exit(1);
  }
}

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
// async function main() {
//   // await mongoose.connect('mongodb://127.0.0.1:27017/wispr');
//   await mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });

// }

const { Server } = require("socket.io");
const io = new Server(server);
// const io=new Server(server
//   ,{
//   cors: {
//     origin: "*", // Allow all origins (use specific origins in production)
//     methods: ["GET", "POST"],
//   },
// }
// );

const onlineUsers = new Map();
let active_receiver="";
 let now;
io.on("connection", (socket) => {
  // console.log("New User Connected:", socket.id);
  
  // Store user on connection
  socket.on("userOnline", (btId) => {
    // Avoid duplicate entries with same btId
    if (!onlineUsers.has(btId)) {
    onlineUsers.set(btId, socket.id);
    socket.btId = btId; // store for disconnect
    console.log("User Online =>", btId, socket.id);
    // Notify all users about online status
    io.emit("updateOnlineStatus", Array.from(onlineUsers.keys()));}
  });

  // When user disconnects
  socket.on("disconnect", () => {
    if (socket.btId && onlineUsers.has(socket.btId)) {
      onlineUsers.delete(socket.btId);
      console.log(`${socket.btId} went offline`);
    }

    io.emit("updateOnlineStatus", Array.from(onlineUsers.keys()));
  });

  //when a user sends a message to a online receiver
  socket.on("sendMessage",({fromId,msg,toId,at})=>{
  if(onlineUsers.has(active_receiver)){
    // console.log(active_receiver,"is Online!!");
      // console.log(toId);
      if(onlineUsers.has(toId)){
        // console.log("ready to send ",msg," to ",toId,onlineUsers.get(toId)," at ",at);
        socket.to(onlineUsers.get(toId)).emit("receiveMessage",{msg:msg,fromId:fromId,at:at});
      }
    }; 
  }
);

});
 


async function getCollectionNames() {
  // Get all collection names
const collections = await mongoose.connection.listCollections();
const collectionNames = collections.map(col => col.name);
// console.log(collectionNames);
return collectionNames;
}

// const WebSocket = require('ws');
// const { log } = require("console");
// const server = new WebSocket.Server({ port: 3001 });
// server.on('connection', (ws) => {
//     console.log('New client connected');

//     ws.on('message', (message) => {
//         console.log(`Received: ${message}`);
//         ws.send(`Server: ${message}`);
//     });

//     ws.on('close', () => console.log('Client disconnected'));
// });
// console.log('WebSocket server is running on ws://localhost:3001');

const userSchema= new mongoose.Schema({
    name:{type:String, required:true},
    btId:{type:String, required:true, unique:true},
    pass:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    loggedIn:{type:Boolean, default:false}
});
const chatSchema=new mongoose.Schema({
  from:{type:String, required:true},
  from_id:{type:String, required:true},
  to:{type:String, required:true},
  to_id:{type:String, required:true},
  message:{type:String, required:true},
  at:{type:String, required:true}
});
let credentials=mongoose.model("Credential",userSchema);
// const Chat = mongoose.model("bt24cse000", chatSchema);
// let user1=new Chat({
//  from:"Dhairya",from_id:"BT24CSE000",
//  to:"Admin",to_id:"BT24CSE070",
//  message:"Yes, Forwarded Assignments, Please Check",
//  at:new Date()
// });
// user1.save();
function isValidID(id) {
  const pattern = /^bt(\d{2})(cse|csd|csa|csh|ece|eci)(\d{3})$/i;
  const match = id.match(pattern);
  if (!match) return false;

  const year = parseInt(match[1]); // Extracted 2-digit year from ID
  if (year < 17) return false;

  const currentDate = new Date();
  const cutoffDate = new Date(`20${year}-07-14`);

  return currentDate > cutoffDate;
}
let userAlert=0;let credentialAlert=0;
app.get("/wispr/login/",async(req,res)=>{

  res.render("login.ejs",{userAlert,credentialAlert});
  userAlert=0;credentialAlert=0;
});
app.get("/wispr/register/",async(req,res)=>{
  res.render("register.ejs",{userAlert,credentialAlert});
  userAlert=0;credentialAlert=0;

});
app.post("/wispr/login",async(req,res)=>{
   let btId=req.body["btId"].toString().toLowerCase().trim();
   const fetchCredential = await credentials.findOne({ btId:btId});
   if(fetchCredential==null){

    console.log("User not found! Please Register first.");
    userAlert=1;
    res.redirect("/wispr/register");}
   else if(!isValidID(btId)){  credentialAlert=1; res.redirect("/wispr/login") }

   else {
    if(fetchCredential.pass==req.body["pass"].toString()){
    console.log("Correct Password");
   let loggedIn=await btId;
    await credentials.findOneAndUpdate({ btId: btId},{loggedIn:true});
    res.render("verifying.ejs",{loggedIn:JSON.stringify(loggedIn), btId: loggedIn.toString().toLowerCase()});
    }
    else{console.log("Incorrect Password!"); credentialAlert=1; res.redirect("/wispr/login")}}

});
app.post("/wispr/register",async(req,res)=>{
let existingCollections=await getCollectionNames();
  if(existingCollections.includes(req.body["btId"].trim().toString().toLowerCase())){
    console.log("User already exists.");userAlert=1;
    res.redirect("/wispr/login");}
  else{
  await new mongoose.model(req.body["btId"].trim().toString().toLowerCase(),chatSchema);
  
  let enteredId=req.body["btId"].trim().toString().toLowerCase();
  if(isValidID(enteredId)){
  
  const newUser = new credentials({
    name: req.body["name"].toString(),
    btId: req.body["btId"].trim().toString().toLowerCase(),
    pass: req.body["pass"].toString(),
    email: req.body["email"].toString()
  });
  await newUser.save();

  //send a spare message from admin to the new user
  let Chat = mongoose.model("bt24cse000", chatSchema);
  let spareMsg=new Chat({
  from:"Admin",from_id:"bt24cse000",
  to:req.body["name"].toString(),
  to_id:req.body["btId"].trim().toString().toLowerCase(),
  message:"Hey There! Welcome to Wispr, a platform for IIITN students to communicate personally.",
  at:new Date()
  });
  spareMsg.save();

  res.redirect("/wispr/login");
  // res.render("verifying.ejs",{loggedIn:JSON.stringify(loggedIn),btId:req.body["btId"].trim().toString()});
  }
  else{credentialAlert=1;res.redirect("/wispr/register")}}
});

app.get("/wispr/home/:btId", async(req, res) => {
  const btId = req.params.btId.toString().trim().toLowerCase();
  let collNames=await getCollectionNames();
  if(collNames.includes(btId)==false){ res.redirect("/wispr/register")}
  else{
  let findStatus = await credentials.findOne({btId:btId},{ _id:0,loggedIn:1});
  findStatus=findStatus.loggedIn;
  if(findStatus==false){res.redirect("/wispr/login");}
  else{
  let Chat = mongoose.model(btId, chatSchema);
  const sentChats = await Chat.find({ from_id: btId });
    let ids= await credentials.find({}, { btId: 1, _id: 0 });
    let received_messages=[];
    for(const id of ids){
      if(id.btId!==btId){
      Chat = mongoose.model(id.btId, chatSchema);
      let msgs=await Chat.find({to_id:btId});
      received_messages= received_messages.concat(msgs);
    }}
    // console.log(received_messages);
    let allMsgs=sentChats.concat(received_messages);
    let ids_names= await credentials.find({}, { btId: 1,name:1, _id: 0 });
    // console.log(ids_names);
    res.render("home", {ids_names:JSON.stringify(ids_names),btId,Id:JSON.stringify(btId),chats:allMsgs,sent_messages:JSON.stringify(sentChats),received_messages :JSON.stringify(received_messages) });
  }}});

app.post("/api/sendMessage", async (req, res) => {
  const { from_id, to_id, message } = req.body;
  active_receiver=to_id.trim();
  let from= await credentials.find({btId:from_id}, { name:1, _id: 0 });
  let to= await credentials.find({btId:to_id}, { name:1, _id: 0 });
  // console.log(message,from[0].name,"{",from_id,"}",to[0].name,"{",to_id,"}");
  let Chat = mongoose.model(from_id.trim(), chatSchema);
  now=new Date();
  const newMessage = new Chat({
    from: from[0].name,
    from_id: from_id.trim(),
    to: to[0].name,
    to_id:to_id.trim(),
    message:message,
    at: now.toString()
  });
  await newMessage.save();
  res.json({ success: true,message: newMessage });
});
app.post("/api/getAllMessages", async (req, res) => {
  
  let {chats_with,loggedIn}=req.body; chats_with=chats_with.toString().trim().toLowerCase();
  if(chats_with!=""){
  let Chat = mongoose.model(loggedIn, chatSchema);
  const sentChats = await Chat.find({ from_id: loggedIn ,to_id:chats_with});
    let received_messages=[];
      Chat = mongoose.model(chats_with, chatSchema);
      received_messages=await Chat.find({to_id:loggedIn});
    let allMsgs=sentChats.concat(received_messages);
    res.json({ success: true,sent : sentChats, received : received_messages,allMessages: allMsgs,loggedIn:loggedIn });
}});

// app.use((req, res) => {
//   res.status(404).render("notFound"); // Assuming you have a 404.ejs or 404.html
// });
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip.startsWith('::ffff:192.168.')) {
    next();
  } else {
    res.render("notFound");;
  }
});

// server.listen(3000,(req,res)=>{
//   console.log("wispr on port 3000");
// });
// Remove this entire block:
// server.listen(3000, '0.0.0.0', () => {
//   console.log("Wispr server running on port 3000");
// });

// Replace with Vercel-compatible export:
module.exports = app;
server.listen(3000, '0.0.0.0', () => {
  console.log("Wispr server running on port 3000");
});

