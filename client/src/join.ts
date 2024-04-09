import { JoinMessage } from "../../shared/Messages";

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

  //for the join button its from client to server but in the index.ts we prase that data and get the player information
  //then we broadcast it out to everyone because we made it a membership type message which is from server to all clients
  joinButton.addEventListener("click", () => {
    const joinMessage: JoinMessage = {
      messageType: "join",
      nickname: nicknameInput.value,
    };
    ws.send(JSON.stringify(joinMessage));
  });
};
