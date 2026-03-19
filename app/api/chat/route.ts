import { GoogleGenerativeAI } from "@google/generative-ai";
import { portfolioData } from "@/lib/chatbot-data";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("Chat service is not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }


    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Ensure history is correctly formatted for Gemini 1.5 Flash
    // It expects alternating user/model roles, starting with user.
    // However, if we just want a simple chat with context, we can construct the history carefully.
    
    // Filter out any potential invalid messages
    const validHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }]
    })).filter((msg: any, index: number) => {
      // If it's the very first message and it's from the model, we should probably skip it 
      // because Gemini expects the conversation to start with a user message usually?
      // Actually, startChat history can contain previous turn.
      // But let's be safe: if history has [model, user, model], that's fine.
      // If history has [model], that's weird.
      if (index === 0 && msg.role === 'model') return false;
      return true;
    });

    const systemPrompt = `You are an AI assistant for Ishaan Dhiman's personal portfolio website. 
    You have access to the following information about Ishaan:
    ${JSON.stringify(portfolioData, null, 2)}
    
    Answer questions about Ishaan, his projects, skills, and experience based on this information. 
    Be friendly, professional, and concise. 
    If a user asks something not in the provided information, politely say you don't have that information but can tell them about Ishaan's professional background.
    Do not make up facts.
    Keep responses relatively short as this is a chat interface.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt
    });

    const chat = model.startChat({
      history: validHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Failed to process chat request");
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
