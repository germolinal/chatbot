import { WebSocketServer } from "ws";
import * as speech from '@google-cloud/speech'
import { NextResponse } from "next/server";



const speechClient = new speech.SpeechClient();

let wss; // Singleton WebSocket server instance





export async function GET(req, res) {
  if (!wss) {
    console.log("Initializing WebSocket server...");

    // Attach WebSocket server to Next.js server
    wss = new WebSocketServer({ port: 3001 });

  
    wss.on("connection", (ws) => {
      console.log("WebSocket connection established");

      const sstReader = speechClient.streamingRecognize({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
        },
        interimResults: true,
      })
        .on('error', (error) => {
          console.error("Speech API error:", error);
          ws.close();
        })
        .on('data', (data) => {
          console.log('something has come back!')          
          const validResults = data.results &&
            data.results.length > 0 &&
            data.results[0].alternatives &&
            data.results[0].alternatives.length > 0
          if (validResults) {
            const transcript = data.results[0].alternatives[0].transcript;
            console.log(transcript)
            // ws.send(JSON.stringify({ transcript })); 
          }
        });

      ws.on("message", (message: Buffer) => {
        // console.log("Received message:", message);
        // console.log('i receive')
        sstReader.write(message)

      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
        sstReader.destroy()
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

  return NextResponse.json({ msg: 'success' })
}
