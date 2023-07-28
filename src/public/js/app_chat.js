const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nick = document.getElementById("nick");

room.hidden = true;

let roomName;
let nickName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room#${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

function showNickName() {
    const h3 = nick.querySelector("h3");
    h3.innerText = `Welcome ${nickName}`;
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nick.querySelector("input");
    socket.emit("save_nick", input.value, showNickName);
    nickName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
nick.addEventListener("submit", handleNickSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left`);
});

socket.on("new_message", addMessage);

socket.on("save_nick", (nickname) => {
    const h3 = nick.querySelector("h3");
    h3.innerText = `Welcome ${nickname}`;
});

socket.on("room_change", (rooms) => {
    if (rooms.length === 0) {
        roomList.innerHTML = "";
        return;
    }
    const roomList = welcome.querySelector("ul");
    rooms.rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
