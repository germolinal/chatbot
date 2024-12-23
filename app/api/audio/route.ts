// server.ts (outside of api directory)
import { WebSocketServer, WebSocket } from "ws";
import * as speech from '@google-cloud/speech';
import { Message } from "@/types/messages";
import { getChat } from "../chat/route";
import { NextResponse } from "next/server";

const speechClient = new speech.SpeechClient();

const wss = new WebSocketServer({ port: 3001 });


wss.on("connection", (ws: WebSocket) => {

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
        // console.log(language, transcript)

        const usrMsg: Message = {
          origin: "user",
          msg: transcript
        }
        ws.send(JSON.stringify(usrMsg))

        const llm = 'gemini-1.5-flash';
        const context = 'you are a help'
        const history: Message[] = []

        getChat(llm, context, transcript, history).then(async (res: any) => {

          if (!res.ok) {
            throw new Error(JSON.stringify(res))
          }
          let msg: Message = await res.json();
          console.log(msg)
          // Send the message as a string
          try {
            ws.send(JSON.stringify(msg));
          } catch (e: any) {
            console.log('Error sending message', e)
          }
        })

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
  ws.on('error', (e) => {
    console.log('Error on websocket', e)
  })
});



export async function GET() {
  return NextResponse.json({ msg: 'success' })
}

