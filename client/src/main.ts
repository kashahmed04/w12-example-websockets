import "./reset.css";
import "./styles.css";

import { Message } from "../../shared/Messages"; //so this says get out the src folder in client, then get out of the client folder
//(this brings us to the root directory), then go to the shared folder then the messages file (yes)
import { setupJoin } from "./join";  // ./ is the same folder and / is go back to the root
import { displayChat, setupChat, updateMembers } from "./chat";
import { Player } from "../../shared/Player";

//why did we put the shared folders in server does it matter where we put it or did it have to be put in server folder**

// Connect to the WebSocket server
// (I'll have to change this to the teacher station IP address for the class demo)
// do we have to say anything to use the web socket API specificially in our code or is it just built in when we say we want
// to make a new web socket and do commands for a web socket
const ws = new WebSocket("ws://localhost:3000");

//player list to show the players in the chat on the left side of the screen (the list of people who are in the chat)
let playerList: Player[];

// once the connection is open
ws.addEventListener("open", (evt) => {
  console.log("connected", evt);
  //web socket connects as soon as we open the browser
  setupJoin(ws);
  // allow the user to monitor the chat (see chat.ts)
  //this allows us to have the connect to the client (us and our message) to the server (websocket) for us to give data
  //to the server only right not the server to all clients yet for the chat message interface**
  setupChat(ws);
});

//the message event listener is the web socket specific event (when the web socket recieves a message then handle it)
ws.addEventListener("message", async (evt) => {
  // parse the JSON message
  //how did we know what message to get specifically (do we use this with any message)** (is it everytime we send a chat
  //and it goes to sendchat() in the chat file then stringifiy that message to send in the server so we parse it here
  //whatever is sent to the socket in chat)**
  //we convert the JSON string and we convert it to a JS object
  //the way we define it we may need one or the other for the Message defintion
  // but we do both so we make sure we get a proper JSON response back
  const message: Message = JSON.parse(evt.data) as Message;
  console.log(message);

  // use "Type Narrowing" - TypeScript knows what type it is based on the messageType
  // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  // we only got message from the message file so how do we know we can use message type as well** (did we import the last line
  // from message talking about if it was a join, membership, or chat, if so why did we check as a string for
  // the switch statements if our string declaration was at the top of the file)**(is it because we check the message type
  // which is a string within the switch statements why did we not start off with that then)**
  switch (message.messageType) {
    case "membership":
      playerList = message.playerList;
      //we get the player list then update the members to get the current member list (this method is in the chat.TS)**
      //could we have made the method here too why did we make it in chat specifically**
      //we only use this when the chat is for membership though (how does it know if a member leaves though or is added)**
      updateMembers(message.playerList);

      //split the nickname by the space and the [0] means (if we have a long user id has left the chat we split it on the space
      //and split it on the space and we get long user id and if the length is greater than 26 it means they are unregistered and
      //we don't want to show that infromation anywhere to clients otherwise if it's less than 26 characters we do want to show that
      //information)(this is intially when they are in the modal or leave or join and we don't want to show their id to the clients
      //if they leave or join)
      //what is the name was less than 26 characters and they did not press the join button, or left the chat how would we now
      //display chat (what is the 0th index for)
      //when someone has not officially joined or left don't show them on the join (the leave chat is handled by the membership message)
      //we say the 0th index because when we split the array it says that ____ has joined so we get the first element of that
      //for the name and use that if it's less than 25 characters we display it otherwise we know it's an id for the nickname
      //(the person has not officially joined yet so we don't show the users)(spaces count as a special character
      //so it does not count in a nickname and it has to be no spaces)
      //in index.ts we have a statement saying that if we join get the message and send it as a stringify but here we parse
      //that data then work with it 
      const nickname = message.text.split(" ")[0];
      if (nickname.length < 26) {
        // I want to hide join/leaves from users without nicknames.
        //the the nickname is less than 25 characters then we want to**
        //how does it know we are referring to the websocket server if its a string for the cases and the server here below 
        //for display chat**
        //how does it know to send the message to the clients from the server if the display chat does not do that
        //and only adds texts and appends it to the message section on the right side of the screen**
        //how do we know what message.text is equal to (where do we set it)**
        displayChat("server", message.text);
      }
      break;

      //if its a case for chatting we just have the users nickname and the message and send it out to the message box on
      //the right of the screen**
      //how does it know to send the message to the server from the client if the display chat does not do that
      //and only adds texts and appends it to the message section on the right side of the screen**
    case "chat":
      displayChat(message.nickname, message.text);
      break;

      //why is there not another case for join here**
  }
});


/**
 * NEW NOTES:
 * 
 * before web sockets every request is a one and done thing for sending and recieving and the connection is closed after we are done
 * with a request 
 * 
 * with web sockets we say we want to connect to messages and messages can be sent back and forth and the browser socket stays
 * open and it's in real time because we send and recieve things in real time 
 * 
 * since web sockets leave the channel open the channel remains open (once chat is open the server knows automatically when a message
 * is recieved whereas with before the client asks for specific things or like a heartbeat and every frequency the server would respond
 * with anything new if we need it and this is how it does the one and done for the previous method (it would close after each heartbeat
 * and open again for the next heartbeat))
 * 
 * we can do networking and chat servers for games with websockets (involves a lot of clients which is everyone using the chat or game)**
 * so far we have made client requests to server or server to us and its back and fourth then it closes after the
 * request has been made and completed from client to server or server to client**
 * so we can only have 1 conneciton in either direction for a request 
 * then it would close and we need to open a new connection for a new request**
 * 
 * but now messages can pass in both directions back and fourth and the connections remains open all the time and
 * the server can push messages to the server without notifying the clients (here is the message do what you will with it)**
 * the server can broadcast messages to all the connected clients as well**
 * the connections remain open for websockets and everything updates in real time whereas before we**
 * 
 * without web sockets we would have heartbeat and server asks if there are any updates from the client
 * and the server would consistenlty ask for updates (same for client with server or only server with client)**
 * if there are any but web sockets allow us to push messages in real time instead of asking if there are any updates (which can delay
 * when things show up)**
 * 
 * go over slide 2**
 * 
 * we now have to have a back end server (we run node but it could be running C#, rust, go, etc.)** we choose the ws library for
 * websockets and the tools link are the other options we can use other than the ws library for websockets** (there are other server
 * side languages that use the ws library)
 * 
 * we have the example code repo but there ie also a local copy we can launch as well (we have 2 npm tabs one for server and
 * one for client we have to have open for web sockets which do)**
 * what does the teacher station one allow does it allow it to be run on npm host** so everyone can connect otherwise it would be local
 * and no network can be created and only us would be in the chat**
 * 
 * the server is a long running node process and the client is our vite dev server like we have been doing**
 * 
 * when we connect we have a chat message server and the left pannel has the name of everyone in the chat and the right tab is the chat
 * box
 * when we make something exposed to host in vite that allows anyone to access the link otherwise it's local to the users machine** 
 * 
 * CHAT APPLICATION:
 * 
 * this repo has two projects it has the client, the server, and a shared directory for TS types (we have to go to the terminal
 * and the server side and)** (so client has index.html, chat.TS, join.TS, and main.TS right)(server has the index.TS)(the shared
 * between the clientand the server is the messages.TS and player.TS)**(why is the shared folder in the server folder then if it's shared
 * wouldnt it be in the root directory as a shared file like how client and server are)**
 * 
 * we need to go to client side in client folder to launch vite because** (how do we do it in vite)**
 * 
 * if we try and do an npm install from the root file it will not work because there is no package.JSON in the root
 * directory (there has to be package.JSON in folder we are installing otherwise it won't work for npm install)**
 * 
 * go over slide 5 and 6** (what is the difference between index.TS (server) and join.TS and chat.TS (client))**
 * 
 * for slide 6 can anyone type the HVZ command to start the game**
 * 
 * 
 * MESSAGE.TS:
 * 
 * on the bottom we have a generic message type that is a union of all the message types in our file (we do this because 
 * we can take the JSON payload we bring in and cast it as the message type is belongs to and it gives us the fields we expect)**
 * 
 * we can also use JS type narrowing it will know which type of message it is and have the proper code hinting**
 * 
 * SERVER DIRECTORY:
 * 
 * node.JS only runs JS so when we go to start a server it runs a TS compile first and it gives us the index JS which is the 
 * compiled down version of JS (or TS)**
 * we then run node with that index.JS (we look at it in TS but it's running in JS though)**
 * 
 * where can we see the index.JS it's not here only the index.TS**
 * 
 * we have uuid in index.ts and its used for (why do we need an id for each player)** 
 * does index.TS run whenever someone new joins the socket (is that how an id gets created for the player and we can use it in the
 * other files)** (how because the other files don't reference index.TS)** 
 * 
 * the servers job recieves messages from the client and also sends messages to the client (clients)** based on certain conditonas (sending
 * messages to everyone)**
 * 
 * we appened the messages to the div with all the messages and we style the username to be bold as well as the text
 * for the updateMmebers (or sendchat or which method)**
 * it's like any other API event we have done and we** (did we do this in the chat file where did we do it)**
 * 
 * one downside is that if we want to make a change we have to restart the server and everything as well as the connections 
 * for the server (websocket) and client (people connected to the webscoket) would be lost**
 * (restart what and what changes)**
 * 
 * HVZ:
 * 
 * looks like last branch but once all of us join there will be a command (HVZ) to bring us to canvas and blue dots are humans and
 * orange dots are zombies and when we press canvas we can move to a target and it slowly moves towards the point to get to the location
 * humans have narrow point of view and zombies have a larger point of view (we used clipping path for canvas to limit our view
 * for the humans and what they can see)(how)**
 * 
 * PLAYER.TS:
 * 
 * we have a lot to the player object and the x and y is the starting location and the tx ty is the target location and we have our 
 * start time and target estimated time (have our starting time stamp and the ending estimated timestamp based on our speed) this way
 * everyone can go based on these time stamps over time and we can send it to the server (is our time stamp is before start or after estimed
 * time or in between then)**
 * 
 * how do we calculate the estimated time to get to our target and why do we need it**
 * how do we know what to send to web socket for program to work**
 * 
 * everytime we click we get new start and end position as well as time and everyone gets a human or zombie type**
 * 
 * INDEX.TS:
 * 
 * if the incoming text is HVZ then we go through the players and make every 6th player a zombie and we make the players and zombies
 * at a particlar part of the screen and they start off as not moving until**
 * 
 * then we get the timestamp for the beginning of the game as well as**
 * 
 * the walkto and turn message get broadcasted to everyone automatically (we trust zombie client to say this person is a zombie when we 
 * tag them and its not secure because)**(we assume the zombie tells the truth)**(how is the zombie a client are the humans a client too)**
 * how are the automatic zombies clients**
 * 
 * MAIN.TS CLIENT:
 * 
 * whenever there is a begin game message (HVZ) in the styles we hide the chat if in game and hide the game if in chat (still in DOM
 * but we hide specific things)**
 * is there a way to get back to chat from game**
 * 
 * GAME.TS:
 * 
 * we set the walking speed in pixels per second for 10 and we set the game up for the websocket and we get the id for the player then set
 * the canvas up then we have the skip mask which does**
 * 
 * we then make a local record of all the players then track the mouse position and everytime we move the mouse we track the mouse
 * x and y positon then we move the offset left and top because**
 * 
 * everytime we click the canvas we get the players current postion, figure out their target position for where they clicked,
 * get that distance by subtracting target from start postion to get the estimated time for 
 * when we will get there and we do it based on the player** (what other calculation is involved for estimated time and 
 * when we will get to our target position)**
 * 
 * get position is the interpolation logic and this tells us if we are at the start or end position or in between (do we stop
 * when we are at the target position)**
 * 
 * render player takes in a player and timestamp for the time for that player and we change the fillstyle based on if they are a human or
 * a zombie then just build a circle there and for every human there is**
 * 
 * the clipping path is done by setting up a narrow arc then smaller circle for human than larger circle (and arc)** for zombie and 
 * context.clip() is that the circle for the human and zombie we only see things within those circles
 * then we get the cone for the position of the players** (how can we see the white background and the players and zombies
 * within the context.clip())**
 * 
 * draw method resets all the clipping paths and canvas and we will reset the canvas as black then set the clipping mask again and we fill
 * the whole canvas with white but only the circles are filled white** (how)**
 * and if we are a zombie render for brains otherwise we are a human then do this every frame**
 * 
 * for each player we write some DOM logic that appends HTML elements to the score board** (what score board)** 
 * 
 * if we wanted to host our own server for a web socket we need to use another service because banjo does not handle the web socket**
 * 
 */