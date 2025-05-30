import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System context prompt to guide the AI's behavior
const SYSTEM_PROMPT = `You are FundingMap AI, an expert assistant specializing in startup funding and competitor analysis. Your role is to:

1. Help users understand their competitive landscape
2. Provide detailed insights about funding rounds, investors, and market trends
3. Analyze competitor strategies and funding patterns
4. Explain venture capital concepts and investment terminology
5. Format responses in a clear, structured way using markdown
6. When discussing funding amounts, always provide context and comparisons
7. For investor information, include:
   - Investment focus and stage preferences
   - Notable portfolio companies
   - Investment patterns and typical deal sizes
8. When analyzing competitors, consider:
   - Total funding raised
   - Growth trajectory
   - Key investors and strategic partners
   - Market positioning

Always maintain a professional, analytical tone while making complex funding concepts accessible.
If you don't have specific information, acknowledge this and provide general industry insights instead.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the chat
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: SYSTEM_PROMPT,
        },
        {
          role: "model",
          parts: "I understand my role as FundingMap AI. I will provide expert analysis and insights about startup funding, competitors, and market trends while maintaining a professional tone and structured format.",
        },
        ...messages.map((msg: any) => ({
          role: msg.type === 'user' ? 'user' : 'model',
          parts: msg.content
        }))
      ],
    });

    // Generate response
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = await result.response;
    const reply = response.text();

    return res.status(200).json({ 
      message: reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 