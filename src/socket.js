import { io } from "socket.io-client";

const socket = io("https://nidaan-6jyx.onrender.com"); // your backend URL
//const socket = io("http://localhost:8000");
export default socket;
