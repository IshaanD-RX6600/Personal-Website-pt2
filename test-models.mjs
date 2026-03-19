import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBr_cdnWZ4-AqOm1j3hyEmdfwKxAqPYPIA"; 

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // For listing models we might need to access the model manager if available in the SDK, 
    // or just try a standard model first.
    // The node output suggests calling ListModels.
    
    // In strict GoogleGenerativeAI SDK, we usually just instantiate a model.
    // If 1.5-flash is not found, let's try gemini-pro.
    console.log("Testing gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    console.log("gemini-pro Success:", result.response.text());

  } catch (error) {
    console.error("gemini-pro Failed:", error.message);
  }
  
  try {
      console.log("Testing gemini-1.5-flash...");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Hello");
      console.log("gemini-1.5-flash Success:", result.response.text());
  } catch (error) {
      console.error("gemini-1.5-flash Failed:", error.message);
  }
}

listModels();
