console.log("Starting email automation...");

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { v4 as uuidv4 } from 'uuid';
import { fetchEmails, sendPlainEmail, sendEmailWithAttachment } from './utils/gmailClient.js';
import { categorizeEmail } from './agents/categorizationAgent.js';
import { draftResponse } from './agents/responderAgent.js';
import { answerWithContext } from './agents/ragAgent.js';
import { proofreadResponse } from './agents/proofreaderAgent.js';

// Ensure attachments folder exists
const ATTACHMENTS_DIR = path.resolve('attachments');
if (!fs.existsSync(ATTACHMENTS_DIR)) {
  fs.mkdirSync(ATTACHMENTS_DIR);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runEmailAutomation() {
  rl.question('How many emails would you like to fetch and process?- ', async (input) => {
    const count = parseInt(input);
    if (isNaN(count) || count <= 0) {
      rl.close();
      return;
    }

    const emails = await fetchEmails(count); // returns array of { body, sender }
    const results = [];

    for (const { body: emailText, sender } of emails) {
      try {
        const category = await categorizeEmail(emailText);
        let response;
        let attachment = null;
        let subject = '';
        let attachmentUrl = null;

        console.log(`📬 Category: ${category}`);

        if (category.toLowerCase().includes('claim')) {
          console.log(`📧 Claim-related email from: ${sender}`);

          const { subject: generatedSubject, body, attachment: invoiceBuffer } = await draftResponse(emailText, category);
          response = body;
          attachment = invoiceBuffer || null;
          subject = generatedSubject;

          if (attachment) {
            const fileName = `invoice_${uuidv4()}.pdf`;
            const filePath = path.join(ATTACHMENTS_DIR, fileName);
            fs.writeFileSync(filePath, attachment);
            attachmentUrl = `/attachments/${fileName}`;

            console.log(`📎 Attachment saved as: ${fileName}`);
          } else {
            console.log(`📭 No attachment for: ${sender}`);
          }

        } else {
          console.log(`📧 Non-claim-related email from: ${sender}`);
          response = await answerWithContext(emailText);
          subject = `Re: Your ${category} Email`;
        }

        // Proofread the final response
        const finalResponse = await proofreadResponse(response);

        // Send the email
        if (attachment) {
          await sendEmailWithAttachment(sender, subject, finalResponse, attachment);
        } else {
          await sendPlainEmail(sender, subject, finalResponse);
        }

        // Add response to results
        results.push({
          email: emailText,
          category,
          response_final: finalResponse,
          invoice_attached: !!attachment,
          attachment_url: attachmentUrl,
          recipient: sender,
        });

      } catch (err) {
        console.error(`❌ Error processing email for ${sender}:`, err.message);
      }
    }

    fs.writeFileSync('new.json', JSON.stringify(results, null, 2));
    rl.close();
  });
}

runEmailAutomation();
