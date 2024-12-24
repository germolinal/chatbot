// server.ts
import { WebSocketServer, WebSocket } from "ws";
import * as speech from '@google-cloud/speech';
import { Message } from "@/types/messages";
import { getChat } from "../chat/route";
import { NextResponse } from "next/server";

const speechClient = new speech.SpeechClient();

interface SpeechRecognitionData {
  language?: string;
  transcript?: string;
}


class SpeechToTextHandler {
  private sstReader: any;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.sstReader = this.createSpeechStream();

    this.sstReader.on('data', this.handleSpeechData.bind(this));
    this.sstReader.on('error', this.handleSpeechError.bind(this));

    this.ws.on('message', this.handleWebSocketMessage.bind(this));
    this.ws.on('close', this.handleWebSocketClose.bind(this));
    this.ws.on('error', this.handleWebSocketError.bind(this))
  }
  private handleWebSocketError(e: any) {
    console.log('Error on websocket', e)
  }
  private createSpeechStream(): any {
    return speechClient.streamingRecognize({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        alternativeLanguageCodes: ['en-US', 'es', 'es-CL']
      },
      interimResults: false,
      singleUtterance: false,
    });
  }


  private handleSpeechData(data: any): void {
    const recognitionData = this.extractRecognitionData(data);
    if (!recognitionData?.transcript) return;
    this.processMessage(recognitionData)

  }

  private extractRecognitionData(data: any): SpeechRecognitionData {
    const validResults = data.results &&
      data.results.length > 0 &&
      data.results[0].alternatives &&
      data.results[0].alternatives.length > 0;

    if (!validResults) {
      return {};
    }

    return {
      language: data.results[0].languageCode,
      transcript: data.results[0].alternatives[0].transcript,
    };
  }

  private async processMessage(data: SpeechRecognitionData) {

    const { transcript } = data;

    const userMessage: Message = {
      origin: "user",
      msg: transcript!
    };
    try {
      this.ws.send(JSON.stringify(userMessage), async () => {

        const llm = 'gemini-1.5-flash';
        const context = 'you are a help';
        const history: Message[] = [];

        try {

          const chatResponse = await getChat(llm, context, transcript!, history)
          if (!chatResponse.ok) {
            throw new Error(JSON.stringify(chatResponse))
          }
          const botMessage: Message = await chatResponse.json();
          this.sendMessage(botMessage);
        } catch (e: any) {
          this.handleError('Error getting chat or parsing chat response', e)
        }

      });
    } catch (e) {
      this.handleError('Error sending user message', e)
    }
  }



  private handleWebSocketMessage(message: Buffer): void {
    this.sstReader.write(message);
  }

  private handleWebSocketClose(): void {
    console.log("WebSocket connection closed...");
    this.sstReader.destroy();
    console.log('closing!')
  }
  private handleSpeechError(error: any): void {
    this.handleError('Speech API error:', error);
    this.ws.close()
  }
  private sendMessage(message: Message) {
    try {
      this.ws.send(JSON.stringify(message))
    } catch (e: any) {
      this.handleError('Error sending message', e)
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
  }
}

const wss = new WebSocketServer({ port: 3001 });
wss.on("connection", (ws: WebSocket) => {
  new SpeechToTextHandler(ws);
});


export async function GET() {
  return NextResponse.json({ msg: 'success' })
}
