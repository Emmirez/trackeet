import { io } from "socket.io-client";
import useAuthStore from "../store/authStore.js";

let socket = null;

export const initSocket = () => {
  const user = useAuthStore.getState().user;
  if (!user?._id) return null;
  if (socket?.connected) return socket;

  // Clean up old socket if exists
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const socketUrl = apiUrl.replace(/\/api\/?$/, "");

  socket = io(socketUrl, {
    query: { userId: user._id },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {});

  socket.on("disconnect", () => {});

  // WhatsApp handoff event
  socket.on("whatsapp_handoff", (data) => {
    window.dispatchEvent(new CustomEvent("whatsapp_handoff", { detail: data }));
  });

  // WhatsApp new message event
  socket.on("whatsapp_message", (data) => {
    window.dispatchEvent(new CustomEvent("whatsapp_message", { detail: data }));
  });

  // Real-time notification
  socket.on("notification", (data) => {
    window.dispatchEvent(
      new CustomEvent("trackeet:notification", { detail: data }),
    );
  });

  // New order notification
  socket.on("new_order", (data) => {
    window.dispatchEvent(
      new CustomEvent("trackeet:notification", { detail: data }),
    );
  });

  return socket;

  // Plan upgraded event
  socket.on("plan_upgraded", (data) => {
    window.dispatchEvent(
      new CustomEvent("trackeet:plan_upgraded", { detail: data }),
    );
  });

  return socket;
};

export const getSocket = () => socket;

export default socket;
