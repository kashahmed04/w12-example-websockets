import { ChatMessage } from "../../shared/Messages";
import { Player } from "../../shared/Player";

//pass in the web socket from main so we can use it here**
export const setupChat = (ws: WebSocket) => {
  const chatInput = document.querySelector("#chatInput") as HTMLInputElement;
  const sendChatButton = document.querySelector(
    "#sendChatButton"
  ) as HTMLButtonElement;

  const sendChat = () => {
    //if the chat input has a length greater than 0 (not blank) then we create a chat message with the message type
    //and the nickname (why is it blank)** then we get the input for what the user put in and make it the text field for
    //the chat message**
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

//we take in the server (I thought it would have been the sender)** and the message the person wanrs to send then
//we create some elements then show the senders username and their message and append that to the messages HTML element**
//we want to make sure to add the speaker which is the sender before the hat though in the chat box**
//why did we have a span for the speaker and not a p tag instead also why did we make a classname for the speaker**
//how does this work for if the input was a membership type and a chat type**
export const displayChat = (sender: string, message: string) => {
  const messages = document.querySelector("#messages") as HTMLDivElement;

  const chat = document.createElement("p");
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

  membersList.replaceChildren();

  players.forEach((player) => {
    if (player.id !== player.nickname) {
      const li = document.createElement("li");
      li.innerText = player.nickname;
      membersList.appendChild(li);
    }
  });
};
