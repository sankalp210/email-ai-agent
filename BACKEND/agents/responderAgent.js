import model from "../utils/geminiClient.js";
import { loadInsuranceData } from "../utils/dataLoader.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";

export async function draftResponse(emailText, category) {
  try {
    if (category.toLowerCase().includes('claim')) {
      const requiredFields = ['name', 'age', 'destination', 'product', 'duration'];
      const missingFields = [];

      const fieldMatchers = {
        name: /name\s*[:\-]?\s*([a-zA-Z. ]+)/i,
        age: /age\s*[:\-]?\s*(\d+)/i,
        destination: /destination\s*[:\-]?\s*([a-zA-Z ]+)/i,
        product: /product\s*[:\-]?\s*([\w\s]+)/i,
        duration: /duration\s*[:\-]?\s*(\d+)/i
      };

      const extractedData = {};
      for (const field of requiredFields) {
        const regex = fieldMatchers[field];
        const match = emailText.match(regex);
        if (match) {
          extractedData[field] = match[1].trim();
        } else {
          missingFields.push(field);
        }
      }

      const insuranceData = await loadInsuranceData();
      // console.log("Insurance data loaded:", insuranceData);
      

      if (missingFields.length > 0) {
        return {
          subject: 'Missing Claim Information',
          body: `Hi, could you please provide the following missing details so we can proceed with your claim: ${missingFields.join(', ')}. Thank you!`,
          attachment: null
        };
      }
      const matchingEntry = insuranceData.find(entry =>
        entry['Age'] == extractedData.age &&
        entry['Destination'].toLowerCase() === extractedData.destination.toLowerCase() &&
        entry['Product Name'].toLowerCase() === extractedData.product.toLowerCase() &&
        entry['Duration'] == extractedData.duration
      );

      if (matchingEntry) {
        extractedData.gender = matchingEntry['Gender'];
        extractedData.agency = matchingEntry['Agency'];
        extractedData.agencyType = matchingEntry['Agency Type'];
        extractedData.channel = matchingEntry['Distribution Channel'];
        extractedData.netSales = matchingEntry['Net Sales'];
        extractedData.commission = matchingEntry['Commision (in value)'];
      } else {
        console.warn("⚠️ No exact dataset match found for extracted fields.");
      }

      console.log("Generating invoice for claim email...");
      const invoiceBuffer = await generateInvoicePDF(emailText, insuranceData, extractedData);
      // console.log("Generated invoice buffer:", invoiceBuffer);

      const customerName = extractedData.name || 'Customer';
      return {
        subject: 'Your Travel Insurance Claim Invoice',
        body: `Dear ${customerName},\n\nThank you for providing the necessary details. Your travel insurance claim invoice is attached.\n\nSincerely,\n\nThe Travel Insurance Support Team`,
        attachment: invoiceBuffer
      };
    }

    const insuranceData = await loadInsuranceData();
   // console.log("Insurance data loaded:", insuranceData);
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
