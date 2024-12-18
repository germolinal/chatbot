import { WebSocketServer } from "ws";

let wss; // Singleton WebSocket server instance

export async function GET(req, res) {
  if (!wss) {
    console.log("Initializing WebSocket server...");

    // Attach WebSocket server to Next.js server
    wss = new WebSocketServer({ port: 3001 });

    wss.on("connection", (ws) => {
      console.log("WebSocket connection established");

      ws.on("message", (message) => {
        console.log("Received message:", message);
        // Handle incoming data (e.g., save audio chunks)
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
      });
    });

    res?.socket?.server.on("upgrade", (request, socket, head) => {
      if (request.url === "/api/audio") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    });

    console.log("WebSocket server attached to Next.js server");
  } else {
    console.log("WebSocket server already running");
  }

  res.status(200).end();
}
