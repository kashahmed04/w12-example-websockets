import { ChatMessage } from "../../shared/Messages";
import { Player } from "../../shared/Player";

export const setupChat = (ws: WebSocket) => {
  const chatInput = document.querySelector("#chatInput") as HTMLInputElement;
  const sendChatButton = document.querySelector(
    "#sendChatButton"
  ) as HTMLButtonElement;

  const sendChat = () => {
    if (chatInput.value.length > 0) {
      const chatMessage: ChatMessage = {
        messageType: "chat",
        nickname: "",
        text: chatInput.value,
      };
      ws.send(JSON.stringify(chatMessage));
      chatInput.value = "";
    }
  };

  sendChatButton.addEventListener("click", sendChat);
  chatInput.addEventListener("keypress", (evt) => {
    if (evt.key === "Enter") {
      sendChat();
    }
  });
};

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
