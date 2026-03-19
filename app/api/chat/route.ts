import { GoogleGenerativeAI } from "@google/generative-ai";
import { portfolioData } from "@/lib/chatbot-data";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemPrompt = `You are an AI assistant for Ishaan Dhiman's personal portfolio website. 
    You have access to the following information about Ishaan:
    ${JSON.stringify(portfolioData, null, 2)}
    
    Answer questions about Ishaan, his projects, skills, and experience based on this information. 
    Be friendly, professional, and concise. 
    If a user asks something not in the provided information, politely say you don't have that information but can tell them about Ishaan's professional background.
    Do not make up facts.
    Keep responses relatively short as this is a chat interface.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
