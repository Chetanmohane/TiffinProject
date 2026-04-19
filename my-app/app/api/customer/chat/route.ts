export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are the Tiffin Project AI Assistant, a friendly and helpful guide for a gourmet tiffin delivery service.
Your goal is to help customers with their meal plans, delivery queries, and menu customizations.

Service Details:
- Cancellation Policy: Cancel before 10:00 AM IST for today's meal.
- Delivery Times: Lunch (01:00 PM), Dinner (08:00 PM).
- Menu: Changes daily, featuring gourmet home-style meals.
- Plans: Various durations (monthly, weekly, etc.) with different price points.
- Pausing: Customers can pause their service anytime to save their meal balance.

Tone: Professional, warm, and helpful. Keep responses concise and formatted nicely with markdown if needed.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiMessage = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}
