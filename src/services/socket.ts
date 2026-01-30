let socket: WebSocket | null = null;

export function connectSocket() {
  if (!socket) {
    socket = new WebSocket("https://playhome-backend.onrender.com");
  }
  return socket;
}
