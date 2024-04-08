import "./reset.css";
import "./styles.css";

import { Message } from "../../shared/Messages"; //so this says get out the src folder in client, then get out of the client folder
//(this brings us to the root directory), then go to the shared folder then the messages file**
import { setupJoin } from "./join"; //why do we need the ./ here why not a / only** (difference between ../,./, and /)**
import { displayChat, setupChat, updateMembers } from "./chat";
import { Player } from "../../shared/Player";

// Connect to the WebSocket server
// (I'll have to change this to the teacher station IP address for the class demo)
// do we have to say anything to use the web socket API specificially in our code or is it just built in when we say we want
// to make a new web socket and do commands for a web socket**
const ws = new WebSocket("ws://localhost:3000");

//player list to show the players in the chat on the left side of the screen (the list of people who are in the chat)**
let playerList: Player[];

// once the connection is open
ws.addEventListener("open", (evt) => {
  console.log("connected", evt);
  // allow the user to join the chat (see join.ts)
  // once we open the browser for the web socket connection we open up the modal before we show their name in the chat
  // but they still initially have connection even though their name may not show until they press the join button**
  // so this makes a local (or network)** connection to the users browser and the server right or is it everyones browser and the server
  // because the link was not local to a users machine and was global**
  // is there one server per user or one server for all the users how does it work if theres only one link for everyone to use**
  // one link for everyone gives one user the connection to the whole server where all the other users are connected to the same server**
  //do we only pass our information from client (us and our nickname) to the server (websocket) and we don't display it yet from
  //server (websocket) to clients (all of us in the chat)**
  //where would we have the server to clients connection because the join message interface does not have that feature**
  //it only has the single client to the server connection**
  setupJoin(ws);
  // allow the user to monitor the chat (see chat.ts)
  //this allows us to have the connect to the client (us and our message) to the server (websocket) for us to give data
  //to the server only right not the server to all clients yet for the chat message interface**
  setupChat(ws);
});

//is message an add event listener for the websocket only and how does it know to target the message we put into the 
//chat input element if we don't target it here**
//we make this a promise becuase**
//go over all**
//how does it know to display this to all users is it because we say we are using the web socket here and we are
//already connected so everyone sees these changes**
//how does the chat move like that how does it not overlap is it a style (for the joins and leaves and chat messages)**
ws.addEventListener("message", async (evt) => {
  // parse the JSON message
  //how did we know what message to get specifically**
  //why did we use message here instead of message type (whats the dfference between both and how do we know
  //when to use them)**
  //why did we say Message = here because we said as message**
  const message: Message = JSON.parse(evt.data) as Message;
  // why do we parse this if our message was made orignally in JS and why did we stringify it in the send chat method then
  // if we were just going to parse it**
  console.log(message);

  // use "Type Narrowing" - TypeScript knows what type it is based on the messageType
  // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  // we only got message from the message file so how do we know we can use message type as well**
  switch (message.messageType) {
    case "membership":
      playerList = message.playerList;
      //we get the player list then update the members to get the current member list (this method is in the chat.TS)**
      //could we have made the method here too why did we make it in chat specifically**
      //we only use this when the chat is for membership though (how does it know if a member leaves though or is added)**
      updateMembers(message.playerList);

      //split the nickname by the space and the [0] means**
      const nickname = message.text.split(" ")[0];
      if (nickname.length < 26) {
        // I want to hide join/leaves from users without nicknames.
        //the the nickname is less than 25 characters then we want to**
        //how does it know we are referring to the websocket server if its a string**
        displayChat("server", message.text);
      }
      break;

      //if its a case for chatting we just have the users nickname and the message and send it out to the message box on
      //the right of the screen**
    case "chat":
      displayChat(message.nickname, message.text);
      break;

      //why is there not another case for join here**
  }
});


/**
 * NEW NOTES:
 * 
 * we can do networking and chat servers for games with web sockets (Involves a lot of clients)
 * so far we have made client requests to server or server to us and its back and fourth then it closes after the
 * request has been made 
 * 
 * but now messages can pass in both directinos back and fourth and the connections remains open all the time
 * the server can push messages to the server without notifying then (here is the message do what you will with it)
 * the server can broadcast messages to all the connected clients as well
 * 
 * without web sockets we would have heartbeat and server asks if there are any updates and we would consistenlty ask for updates
 * if there are any but web sockets allow us to push emssages in real time instead of asking if there are any updates
 * 
 * we now have to have a back end server (we run node but it could be running C#, rust, go, etc.) we choose the ws library for
 * web sockets and the tools link are the other options we can use other than the ws library 
 * 
 * we have the example code repo but there ie also a local copy we can launch as well (we have 2 npm tabs one for server and
 * one for client we have to have open for web sockets)
 * 
 * the server is a long running node process and the client is our vite dev server like we have been doing 
 * 
 * when we connect we have a chat message server and the left pannel has everyone in the chat and the right tab are the chat
 * boxes 
 * when we make something exposed to host in vite that allows anyone to access the link otherwise it's locally to the users machine 
 * 
 * CHAT APPLICATION:
 * 
 * this repo has two projects it has the client, the server, and a shared directory for TS types (we have to go to the terminal
 * and the server side and)
 * 
 * we need to go to client side in client folder and**
 * 
 * if we try and do an npm install from the root file it will not work because there is no package.JSON in the root
 * directory (there has to be package.JSON in folder we are installing otherwise it won't work for npm install)
 * 
 * MESSAGE.TS:
 * 
 * we have a base message class adn it says each message will have a message type and we have
 * some interfaces that provide an actual value for the message type and adds fields for that particular type of messages
 * on the bottom we have a generic message type that is a union of all the message types in our file (we do this because 
 * we can take the JSON payload we bring in and cast it as the message type is belongs to and it gives us the fields we expect)
 * 
 * we can also use JS type narrowing it will know which type of message it is and have the proper code hinting**
 * 
 * SERVER DIRECTORY:
 * 
 * node.JS only runs JS so when we go to satart a server it runs a TS compile first and it gives us the index JS which is the 
 * compiled down version of JS
 * we then run node with that index.JS (we look at it in TS but it's running in JS though)
 * 
 * we have uuid in index.ts and its used for 
 * we have a server player is like a player but it has a web socket, we then maek a web socket and tell it what port to run on
 * we then have a map for a stine for user id then the server player which is empty then we have a broadcast to send a message
 * to all the players then conver the map into an array 
 * 
 * we then have our websocket listen for a connection which is whenever a person enters the server (or subscrobes to server)
 * then it connects and opens that web socket and eveyrthing within the connection code is for the individual player in the chat
 * and we have the message if a player sends one as well
 * 
 * the data comes in as an array string then we convert it into a string (JS object with JSON.parse) then we store it as a message
 * type which is our union type of message then we have type narrowing snd we switch based on the incoming message type and when
 * we are in the caseblock for join message it knows it was a join message and we show that a person has joined (we set the players
 * nickname and we construct a membership message and we say they have joined the chat then update the chat player list then
 * broadcast that message out to everyone)
 * 
 * broadcast goes through player list and tells each player to use their own web socket to see the message that came in
 * when we chat message occurs then we build a chat message then broadcast it out to everyone 
 * 
 * close happens when the client leaves or exits the browser so we delete the player by id and we say the player has left the chat
 * to everyone from a broadcast
 * 
 * the servers job recieves messages from the client and also sends messages to the client based on certain conditonas (sendin
 * message to everyone)
 * 
 * CLIENT:
 * 
 * INDEX.HTML:
 * 
 * we have dialouge box and we have the input and join button and we have an oninput on the user input in the dialouge and whenever
 * we change the value only limit it to numbers and letters not any special characters and also limit the entry to only 25 characters
 * 
 * MAIN.TS:
 * 
 * opens a new webs socket locally and maintains the player list and it sets the code for join and chat when we open the chat
 * and whenever it recives a message we parse the message from JSON into a JS object and its a regular message until the switch
 * statement until its a regular message or chat message to go to everyone then we display the message
 * 
 * JOIN.TS:
 * 
 * set up join gets query selectors and shows the modal and disbales the join button until 3 character for nickname has happened 
 * then we send the join message to the server
 * 
 * CHAT.TS:
 * 
 * send the chat whenever we click the send button or when we press enter while we are in the chat textbox then if there is something in
 * the input when we send it empty the textbox otherwise we don't
 * 
 * we appened the messages to the div with all the messages and we style the username to be bold as well as the tetx
 * for the updateMmebers it's like any other API event we have done and we
 * 
 * one downside is that if we want to make a change we have to restart the server and everything as well as the connections would be lost
 * (resatrt what and what changes)**
 * 
 * HVZ:
 * 
 * looks like last branch but once all of us join there will be a command to bring us to canvas and blue dots are humans and
 * orange dots or zombies and when we press canvas we can move to a target and it slowly moves towards the point to get to the location
 * humans have narrow point of view and zombies have a larger point of view (we used clipping path for canvas to limit our view
 * for the humans)
 * 
 * PLAYER.TS:
 * 
 * we have a lot to the player object and the x and y is the starting location and the tx ty is the target location and we have our 
 * start time and target estimated time (have our starting time stamp and the ending estimated timestamp based on our speed) this way
 * everyone can go based on these time stamps over time and we can send it to the server (is our time stamp is before start or after estimed
 * time or in between then)**
 * 
 * everytime we click we get new start and end position as well as time and everyone gets a human or zombie type
 * 
 * INDEX.TS:
 * 
 * if the incoming text is HVZ then we go through the players and make every 6th player a zombie and we make the players and zombies
 * at a particlar part of the screen and they start off as not moving until
 * 
 * then we get the timestamp for the beginning of the game as well as 
 * 
 * the walkto and turn messafe get broadcast to everyone auotmcaitlly (we trust zombie client to say this person is a zombie when we 
 * tag them and its not secure because)(we assume the zombie tells the truth)
 * 
 * MAIN.TS CLIENT:
 * 
 * whenever there is a begin game message and in the styles we hide the chat if in game and hide the game if in chat (still in DOM
 * but we hide specific things)
 * 
 * GAME.TS:
 * 
 * we set the walking speed in pixels per second for 10 and we set the game up for the web socket and we get the id for the player then set
 * the canvas up then we have the skip mask which does
 * 
 * we then make a local record of all the players then track the mouse position and everytime we move the mouse we track the mouse
 * x and y positon then we move the offset left and top because 
 * 
 * everytime we click the canvas we get the players current postion, figure out their target position for where they clicked,
 * ger that distance by subtracting target from start to get the estimated time for when we will get there and we do it based on the player
 * 
 * get position is the interpolation logic and this tells us if we are at the start or end position or in between (do we stop
 * when we are at the target position)**
 * 
 * render player takes in a player and timestamp for the time for that player and we change the fillstyle based on if they are a human or
 * a zombie then just build a circle there and for every human there is
 * 
 * the clipping path is done by setting up a narrow arc then closer circle for human than larger circle for zombie and 
 * context.clip() is that the circle for the human and zombie we only see things within those circles
 * then we get the cone to to in the position of the players
 * 
 * draw method resets all the clipping paths and canvas and we will the canvas as black then set the clipping mask and we fill
 * the whole canvas with white but only the circles are filled white and if we are a zombie render for brains otherwise we are a human then
 * do this every frame
 * 
 * for each player we write some DOM logic that appends HTML elements to the score board 
 * 
 * if we wanted to host our own server for a web socket we need to use another service because banjo does not handle the web socket
 * 
 */