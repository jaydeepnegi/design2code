import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function convertDesignToCode(base64Image: string, mimeType: string): Promise<string> {
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

  const imagePart = {
    inlineData: {
      data: base64Image.split(",")[1], // Remove the data:image/png;base64, prefix
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
    });

    let code = response.text || "";
    
    // Clean up markdown if the model ignored the "ONLY code" instruction
    code = code.replace(/^```html\n/, "").replace(/\n```$/, "").trim();
    
    return code;
  } catch (error) {
    console.error("Error converting design:", error);
    throw new Error("Failed to convert design. Please try again.");
  }
}
