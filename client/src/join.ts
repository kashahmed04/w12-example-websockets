import { JoinMessage } from "../../shared/Messages";

//this takes in a websocket from main (ws) so we can do things with the websocket here as well**
//we dont need imports or exports for passing around the websocket right we can just pass them in like we did here**
//this is just responsible for the modal and passing the data in for the join message (client) into the websocket (server) right**
//but not actually sending the join message to all the clients right the websocket server only gets the data from the client here right**
export const setupJoin = (ws: WebSocket) => {
  const joinDialog = document.querySelector("#joinDialog") as HTMLDialogElement;
  const joinButton = document.querySelector("#joinButton") as HTMLButtonElement;
  const nicknameInput = document.querySelector(
    "#nicknameInput"
  ) as HTMLInputElement;

  //we show the dialog for the input section and we disable the join button until they have entered a valid nickname
  //that has at least 3 characters in it**
  //we know to enable the join button if the condtional is true in the input event listener**
  //could we have put joinButton.enabled = nicknameInput.value.length > 3; as well**
  joinDialog.showModal();
  joinButton.disabled = true;

  nicknameInput.addEventListener("input", () => {
    joinButton.disabled = nicknameInput.value.length < 3;
  });

  //we create a join message type for each user that joins and we give it the message type and the nickname 
  //value (the entry we put in for the nickname)** then we send our join message to the websocket we created in main
  //and we have to make sure when we send something to the server (websocket) it has to be in JSON string form (JSON.stringify) 
  //otherwise it won't work**
  //the .send it built into the web socket API to send things to the server (web socket)**
  //we make the join message a string with JSON.stringify then send it to the server (web socket) to display the message
  //that someone has joined (to all the clients or not because the join message says it only goes from the single client
  //that joined to the server so does it not display anything to all users yet)**
  joinButton.addEventListener("click", () => {
    const joinMessage: JoinMessage = {
      messageType: "join",
      nickname: nicknameInput.value,
    };
    ws.send(JSON.stringify(joinMessage));
  });
};

//so does setupjoin and setupchat just go from client (us and our nickname input or message) to server (websocket) 
//for when someone initially connects to the websocket (server) where does the server to all clients go to so everyone can see
//a member joined or left or if there was a chat****
