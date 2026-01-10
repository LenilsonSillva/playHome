let socket: WebSocket | null = null;

export function connectSocket() {
  if (!socket) {
    socket = new WebSocket("wss://SEU-APP.onrender.com");
  }
  return socket;
}
