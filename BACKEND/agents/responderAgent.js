

import model from "../utils/geminiClient.js";
import { loadInsuranceData } from "../utils/dataLoader.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";

export async function draftResponse(emailText, category) {
  try {
    // If it's a claim-related email, process with invoice logic
    if (category.toLowerCase().includes('claim')) {
      const requiredFields = ['name', 'age', 'destination', 'product', 'duration'];
      const missingFields = [];

      // Smarter field matchers
      const fieldMatchers = {
        name: /name\s*[:\-]?\s*[a-z]+/i,
        age: /age\s*[:\-]?\s*\d+/i,
        destination: /destination\s*[:\-]?\s*\w+/i,
        product: /product\s*[:\-]?\s*[\w\s]+/i,
        duration: /duration\s*[:\-]?\s*\d+/i
      };

      for (const field of requiredFields) {
        const regex = fieldMatchers[field];
        if (!regex.test(emailText)) {
          missingFields.push(field);
        }
      }
      const insuranceData = await loadInsuranceData(); // This now loads from the JSON file if available
      console.log("Insurance data loaded:", insuranceData);

      if (missingFields.length > 0) {
        return {
          subject: 'Missing Claim Information',
          body: `Hi, could you please provide the following missing details so we can proceed with your claim: ${missingFields.join(', ')}. Thank you!`,
          attachment: null
        };
      }

      // All required data present — generate invoice
      console.log("Generating invoice for claim email...");
    //   const insuranceData = await loadInsuranceData(); // This now loads from the JSON file if available
      const invoiceBuffer = await generateInvoicePDF(emailText, insuranceData);
      console.log("Generated invoice buffer:", invoiceBuffer);

      return {
        subject: 'Your Travel Insurance Claim Invoice',
        body: `Hello,\n\nThank you for providing the required details. Please find attached your travel insurance claim invoice.\n\nBest regards,\nTravel Insurance Support Team`,
        attachment: invoiceBuffer
      };
    }
    
    const insuranceData = await loadInsuranceData(); // This now loads from the JSON file if available
      console.log("Insurance data loaded:", insuranceData);
    // Default polite Gemini-generated response for non-claim emails
    const prompt = `
You are an AI email assistant. Based on the category "${category}", write a professional and polite response to this email:

"${emailText}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return {
      subject: `Re: Your ${category} Email`,
      body: response.text().trim(),
      attachment: null
    };

  } catch (error) {
    console.error("ResponderAgent Error:", error);
    return {
      subject: 'Error Processing Request',
      body: "We're sorry, but there was an issue processing your request. Please try again later.",
      attachment: null
    };
  }
}
