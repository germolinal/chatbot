import { WebSocketServer } from "ws";
import * as speech from '@google-cloud/speech'
import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";



const speechClient = new speech.SpeechClient();

let wss: WebSocketServer; // Singleton WebSocket server instance





export async function GET(req: NextApiRequest, res: NextApiResponse) {
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
          alternativeLanguageCodes: ['en-US', 'es', 'es-CL']
        },
        interimResults: false,
        singleUtterance: false,
      })
        .on('error', (error) => {
          console.error("Speech API error:", error);
          ws.close();
        })
        .on('data', (data) => {
          const validResults = data.results &&
            data.results.length > 0 &&
            data.results[0].alternatives &&
            data.results[0].alternatives.length > 0
          if (validResults) {
            const language = data.results[0].languageCode            
            const transcript = data.results[0].alternatives[0].transcript;
            console.log(language, transcript)
            // ws.send(transcript);
          }
        });

      ws.on("message", (message: Buffer) => {   
        sstReader.write(message)

      });

      ws.on("close", () => {
        console.log("WebSocket connection closed...");
        sstReader.destroy()
        console.log('closing!')        
      });
    });

    // @ts-ignore
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
