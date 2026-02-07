
import { GoogleGenAI, Type } from "@google/genai";
import { TimerMode, AIInsight } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Always use process.env.API_KEY directly for initialization
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getFocusInsight(taskTitle: string, mode: TimerMode): Promise<AIInsight> {
    const prompt = mode === TimerMode.WORK 
      ? `あなたは生産性コーチです。タスク「${taskTitle}」に取り組むユーザーのために、次の25分間の集中力を最大化するアドバイスを1つ、モチベーションを上げる言葉を1つ提供してください。日本語で回答してください。`
      : `集中セッションが終わりました。次の休憩時間に推奨されるリフレッシュ活動（ストレッチ、深呼吸など）を1つ提案してください。日本語で回答してください。`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tip: { type: Type.STRING, description: '集中力を高めるための具体的なヒント' },
              motivation: { type: Type.STRING, description: 'やる気を引き出す短い一言' },
              suggestedBreakActivity: { type: Type.STRING, description: '休憩中にすべきこと' }
            },
            required: ['tip', 'motivation', 'suggestedBreakActivity']
          }
        }
      });

      return JSON.parse(response.text || '{}') as AIInsight;
    } catch (error) {
      console.error("Gemini Error:", error);
      return {
        tip: "深呼吸をして、目の前の1つのことに集中しましょう。",
        motivation: "小さな一歩が大きな成果につながります。",
        suggestedBreakActivity: "遠くの景色を見て目を休めましょう。"
      };
    }
  }
}

export const geminiService = new GeminiService();
