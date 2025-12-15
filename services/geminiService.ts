import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Employee, Task, AIAnalysisResult, Product, AIProductAnalysis } from "../types";

// Initialize the client
// NOTE: Process.env.API_KEY is handled by the build system/environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Creates a system prompt that gives the AI full context of the organization's state.
 */
const createSystemContext = (employees: Employee[], tasks: Task[]) => {
  return `
    You are NeuroWork, an advanced AI Organizational Intelligence System.
    Your goal is to optimize workload distribution, prevent employee burnout, and ensure skills are utilized correctly.
    
    You prefer logic and fairness over speed.
    You act as a neutral, data-driven manager.

    CURRENT ORGANIZATIONAL STATE:
    
    EMPLOYEES:
    ${JSON.stringify(employees, null, 2)}

    TASKS:
    ${JSON.stringify(tasks, null, 2)}

    When answering questions:
    1. Reference specific employees and tasks by name.
    2. Explain the "Why" behind your reasoning.
    3. If an employee is overloaded (score > 80), suggest relief.
    4. If an employee is underutilized (score < 40), suggest open tasks they can take.
  `;
};

export const chatWithAI = async (
  message: string, 
  history: {role: string, parts: {text: string}[]}[],
  employees: Employee[],
  tasks: Task[]
): Promise<string> => {
  try {
    const systemInstruction = createSystemContext(employees, tasks);
    
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: history as any,
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I am currently analyzing high volumes of data and cannot respond. Please check your API configuration.";
  }
};

export const analyzeWorkload = async (employees: Employee[], tasks: Task[]): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      Analyze the current workload data provided in the system instruction.
      Return a JSON object with:
      1. A short summary paragraph of the organization's health.
      2. A list of names of employees at risk of burnout.
      3. An efficiency score (0-100) based on resource utilization.
      4. A list of 3 specific actionable recommendations to improve the situation.
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        burnoutRisk: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        },
        efficiencyScore: { type: Type.INTEGER },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["summary", "burnoutRisk", "efficiencyScore", "recommendations"]
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: createSystemContext(employees, tasks),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "System offline. Unable to calculate metrics.",
      burnoutRisk: [],
      efficiencyScore: 0,
      recommendations: ["Check API Key", "Retry Analysis"]
    };
  }
};

const ANALYSIS_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      futureOutlook: { type: Type.STRING },
      predictedGrowth: { type: Type.NUMBER },
      keyRisks: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["summary", "futureOutlook", "predictedGrowth", "keyRisks"]
  };

export const analyzeProduct = async (product: Product): Promise<AIProductAnalysis> => {
    try {
        const prompt = `
            Analyze the following product data:
            Name: ${product.name}
            Description: ${product.description}
            6-Month History: ${JSON.stringify(product.history)}
            
            Provide a performance summary, a future outlook prediction based on the trend, 
            a predicted growth percentage for the next month, and potential risks (e.g., increasing server costs).
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ANALYSIS_SCHEMA
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        return JSON.parse(text) as AIProductAnalysis;

    } catch (error) {
        console.error("Product Analysis Error", error);
        return {
            summary: "Unable to analyze.",
            futureOutlook: "N/A",
            predictedGrowth: 0,
            keyRisks: ["API Error"]
        }
    }
}

export const analyzeCompany = async (products: Product[]): Promise<AIProductAnalysis> => {
    try {
        const prompt = `
            Analyze the aggregated performance of the entire company based on these products:
            ${JSON.stringify(products.map(p => ({
                name: p.name,
                history: p.history,
                status: p.status
            })))}

            Provide an executive summary of the company's financial health (profit margins, cost efficiency),
            a future outlook for the portfolio, predicted total growth percentage, and company-wide risks.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ANALYSIS_SCHEMA
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        return JSON.parse(text) as AIProductAnalysis;
    } catch (error) {
        console.error("Company Analysis Error", error);
        return {
            summary: "Unable to analyze company data.",
            futureOutlook: "N/A",
            predictedGrowth: 0,
            keyRisks: ["API Error"]
        }
    }
}