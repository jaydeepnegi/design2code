import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export async function convertDesignToCode(base64Image: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
    throw new Error("Gemini API key is not configured. Please ensure you have added 'MY_GEMINI_KEY' to your secrets.");
  }

  // Initialize inside the function to ensure the most up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey });
  
  // Use gemini-3-flash-preview for speed and multimodal support
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a world-class frontend engineer. 
    Convert this design screenshot into a single-file HTML document.
    
    Requirements:
    1. Use Tailwind CSS (via CDN: <script src="https://cdn.tailwindcss.com"></script>) for all styling.
    2. Ensure the design is fully responsive (mobile, tablet, desktop).
    3. Use Lucide icons (via CDN if possible, or SVG) or standard emojis if needed.
    4. Include any necessary JavaScript for basic interactivity (e.g., mobile menu toggles, tab switching).
    5. The code should be production-ready, clean, and accessible.
    6. Use high-quality placeholder images from Unsplash or Picsum if the design has images.
    7. Return ONLY the HTML code. Do not include any explanations or markdown formatting like \`\`\`html.
  `;

  const base64Data = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [imagePart, textPart] }],
    });

    let code = response.text || "";
    
    // Improved cleanup to handle various markdown code block formats
    code = code.replace(/```html/g, "")
               .replace(/```/g, "")
               .trim();
    
    if (!code) {
      throw new Error("The model returned an empty response.");
    }
    
    return code;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Provide more specific error messages if possible
    if (error.message?.includes("API key not valid")) {
      throw new Error("Invalid API key. Please check your settings.");
    }
    
    if (error.message?.includes("User location is not supported")) {
      throw new Error("The Gemini API is not available in your current location.");
    }
    
    throw new Error(`Failed to convert design: ${error.message || "Unknown error"}. Please try again.`);
  }
}
