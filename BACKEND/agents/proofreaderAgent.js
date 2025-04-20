import model from "../utils/geminiClient.js";

export async function proofreadResponse(text) {
  const prompt = `
You are a professional editor. Proofread this email for grammar, tone, clarity, and relevance. Improve it without changing the meaning.

"${text}"
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}
