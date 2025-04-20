import model from "../utils/geminiClient.js";
import fs from "fs";

const productKnowledge = JSON.parse(
  fs.readFileSync("knowledgebase/product_faqs.json", "utf-8")
);

function retrieveRelevantInfo(emailText) {
  // Naive keyword match for now (can later use embedding search)
  return productKnowledge
    .filter((entry) =>
      emailText.toLowerCase().includes(entry.keyword.toLowerCase())
    )
    .map((entry) => `${entry.question}: ${entry.answer}`)
    .join("\n\n");
}

export async function answerWithContext(emailText) {
  const context = retrieveRelevantInfo(emailText);
  const prompt = `
You are a support assistant. Use the following product information to respond:

Product Info:
${context}

Email:
"${emailText}"

Write a helpful and accurate response.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}
