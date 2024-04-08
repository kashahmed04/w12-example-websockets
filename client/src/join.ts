import { JoinMessage } from "../../shared/Messages";

export const setupJoin = (ws: WebSocket) => {
  const joinDialog = document.querySelector("#joinDialog") as HTMLDialogElement;
  const joinButton = document.querySelector("#joinButton") as HTMLButtonElement;
  const nicknameInput = document.querySelector(
    "#nicknameInput"
  ) as HTMLInputElement;

  joinDialog.showModal();
  joinButton.disabled = true;

  nicknameInput.addEventListener("input", () => {
    joinButton.disabled = nicknameInput.value.length < 3;
  });

  joinButton.addEventListener("click", () => {
    const joinMessage: JoinMessage = {
      messageType: "join",
      nickname: nicknameInput.value,
    };
    ws.send(JSON.stringify(joinMessage));
  });
};
