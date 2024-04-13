import { ChatMessage } from "../../shared/Messages";
import { Player } from "../../shared/Player";

//pass in the web socket from main so we can use it here
export const setupChat = (ws: WebSocket) => {
  const chatInput = document.querySelector("#chatInput") as HTMLInputElement;
  const sendChatButton = document.querySelector(
    "#sendChatButton"
  ) as HTMLButtonElement;

  const sendChat = () => {
    //the nickname is blank so we don't want someone impersonating someone else (we leave the name blank here but in index.ts
    //the server gets the name of the player sending the message and gives it to all the clients)
    //if someone gave an incorrect nickname if the server just trusts what the player sent then it would be easy to impersonate someone
    //the socket knows which person it is in index.ts so we assign the name there
    //over here there is no clear connection on who is connected to the web socket but in index.ts it is so we assign the name there
    //in the server it has several connections to the server and it maps to one of the other clients so the server
    //knows which socket and browser it belongs to 
    //main only has to one web socket (only one to listen and send)
    //main is only us and the server and index.ts is all the clients and the server (multiple aspects)**
    if (chatInput.value.length > 0) {
      const chatMessage: ChatMessage = {
        messageType: "chat",
        nickname: "",
        text: chatInput.value,
      };
      //after we get our chat message information we send the data over as a JSON.stringify because that's what websockets
      //accept and they don't accept a JS object**
      ws.send(JSON.stringify(chatMessage));
      //when we send the message over to the websocket (server) we clear the text field so the user can type in something new**
      chatInput.value = "";
      //so does this automatically send data to the websocket (server) even though we don't press the send button (why)**
    }
  };

  //we add an event listener for if we click that we want to send the message we get the input from the sendchat 
  //above and we do the same for if we press enter instead of the send button to get the chat input value**
  //there is no return in send chat so is the reason to call it so it can go into the websocket (server) based on our input**
  //the chat message says it goes from client to server then server to all clients but here we just go from client (us and our message)
  //to the server (websocket) to pass our input in**
  sendChatButton.addEventListener("click", sendChat);
  chatInput.addEventListener("keypress", (evt) => {
    if (evt.key === "Enter") {
      sendChat();
    }
  });
};

//we are saying the server show this to all the clients that this person has joined or left the chat for the membership
//for the chat we are saying that
//after we get our chat message information we send the data over as a JSON.stringify because that's what websockets
//accept and they don't accept a JS object (for sentchat())**
//display chat does not display the message it just uses the message it got from the server (the same case for a chat
//we have the nickname for the sender and their message)
export const displayChat = (sender: string, message: string) => {
  const messages = document.querySelector("#messages") as HTMLDivElement;

  const chat = document.createElement("p");
  //a span is an inline element and we are marking a portion of that text from different as the rest of it
  //we use a span because we don't want there to be a line break we just want this information to be highlighted
  //(in the styles we make the name bold to highlight it)
  //we need the classname to put styles on the element 
  const speaker = document.createElement("span");
  speaker.className = "speaker";
  speaker.innerText = `${sender}:`;
  chat.innerText = ` ${message}`;
  chat.prepend(speaker);
  messages.appendChild(chat);
};

//takes in a player list from main to update the current players in the chat**
//we get the members list then we replace children which empties out the list**
//then for each player if the id does not equal the nickname (how do we know what the id is)**
//then we create a list element then make the innertext the nickname then append it to the ul**
export const updateMembers = (players: Player[]) => {
  const membersList = document.querySelector(
    "#membersList"
  ) as HTMLUListElement;

  //replace children clears out the whole HTML element (it would clear all the children regardless of what type they are)
  membersList.replaceChildren();

  //when the browser has connected but not joined there exists a player that has the uuid and no nickname and in index.ts 
  //we set the nickname of id for the id if they did not make a nickname (when they are on the modal)
  //by saying that the player id is not the same as the nickname they are already made and did the modal already 
  //create an entry in our connections array
  //players.set(id, { id, nickname: id, ws });
  //the .set is a map thing and a map is like dictionary and it lets us look up an object by and id within index or indexOf
  //map has functions to help us set things in the map and the object literals we edit directly and map restricts what we put in it
  //more than the object literal
  //the player stores the id and the name as one value in the array (based on the player file)

  players.forEach((player) => {
    if (player.id !== player.nickname) {
      const li = document.createElement("li");
      li.innerText = player.nickname;
      membersList.appendChild(li);
    }
  });
};
