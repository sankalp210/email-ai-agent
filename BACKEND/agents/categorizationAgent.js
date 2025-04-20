import model from "../utils/geminiClient.js";
import { withRetry } from "../utils/retry.js";

export async function categorizeEmail(emailText) {
  return await withRetry(async () => {
    const prompt = `
You are an email classifier for a travel insurance company. Classify this email into one of the following categories based on the content of the email:

- Claim Inquiry: An email related to a claim, either asking for the status, details, or making a claim.
- Policy Inquiry: An email asking about the details of a travel insurance policy, coverage, or terms.
- Policy Purchase: An email requesting to purchase a new travel insurance policy.
- Cancellation Request: An email asking to cancel an existing policy.
- General Inquiry: Any other general inquiries related to travel insurance.
- Complaint: An email expressing dissatisfaction or complaints regarding the insurance service.
- Feedback: An email providing feedback about the insurance services or experience.
- Product Support: An email asking for help with insurance-related products, like assistance with filing claims or understanding coverage.
- Other: If the email does not fall into the categories above.

Email: """${emailText}"""
Respond with just the category.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  });
}
