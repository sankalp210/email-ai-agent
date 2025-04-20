// import fs from "fs/promises";
// import { google } from "googleapis";
// import open from "open";
// import readline from "readline";

// const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// const TOKEN_PATH = 'token.json';

// async function authorize() {
//   const credentials = JSON.parse(await fs.readFile('credentials.json', 'utf-8'));
//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//     const token = await fs.readFile(TOKEN_PATH, 'utf-8');
//     oAuth2Client.setCredentials(JSON.parse(token));
//     return oAuth2Client;
//   } catch {
//     return getNewToken(oAuth2Client);
//   }
// }

// async function getNewToken(oAuth2Client) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });

//   console.log('\n🔑 Authorize this app by visiting this URL:\n', authUrl);
//   await open(authUrl);

//   const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
//   const code = await new Promise((resolve) => rl.question('\nEnter the code from that page: ', resolve));
//   rl.close();

//   const { tokens } = await oAuth2Client.getToken(code);
//   oAuth2Client.setCredentials(tokens);
//   await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
//   console.log('✅ Token stored to', TOKEN_PATH);
//   return oAuth2Client;
// }

// export async function fetchEmails() {
//   const auth = await authorize();
//   const gmail = google.gmail({ version: 'v1', auth });

//   const res = await gmail.users.messages.list({
//     userId: 'me',
//     labelIds: [process.env.GMAIL_LABEL || 'INBOX'],
//     maxResults: 5,
//   });

//   const messages = res.data.messages || [];
//   const emailTexts = [];

//   for (const msg of messages) {
//     const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id });
//     const parts = fullMsg.data.payload.parts || [];
//     let body = fullMsg.data.snippet;

//     for (const part of parts) {
//       if (part.mimeType === 'text/plain' && part.body.data) {
//         const buff = Buffer.from(part.body.data, 'base64');
//         body = buff.toString('utf-8');
//         break;
//       }
//     }

//     emailTexts.push(body.trim());
//   }

//   return emailTexts;
// }


import fs from "fs/promises";
import { google } from "googleapis";
import open from "open";
import readline from "readline";
import mailcomposer from "mailcomposer";

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify', // helpful if modifying labels later
    'https://www.googleapis.com/auth/gmail.compose'
  ];
  
const TOKEN_PATH = 'token.json';

async function authorize() {
  const credentials = JSON.parse(await fs.readFile('credentials.json', 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch {
    return getNewToken(oAuth2Client);
  }
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔑 Authorize this app by visiting this URL:\n', authUrl);
  await open(authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise((resolve) => rl.question('\nEnter the code from that page: ', resolve));
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
  console.log('✅ Token stored to', TOKEN_PATH);
  return oAuth2Client;
}

export async function fetchEmails(count = 5) {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    labelIds: [process.env.GMAIL_LABEL || 'INBOX'],
    maxResults: count,
  });

  const messages = res.data.messages || [];
  const emailData = [];

  for (const msg of messages) {
    const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' });
    const headers = fullMsg.data.payload.headers;
    const fromHeader = headers.find(h => h.name === 'From');
    const from = fromHeader ? fromHeader.value : '';

    let body = fullMsg.data.snippet;
    const parts = fullMsg.data.payload.parts || [];

    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        const buff = Buffer.from(part.body.data, 'base64');
        body = buff.toString('utf-8');
        break;
      }
    }

    emailData.push({ body: body.trim(), sender: from });
  }

  return emailData;
}

export async function sendPlainEmail(to, subject, body) {
  return await sendEmail({ to, subject, body });
}

export async function sendEmailWithAttachment(to, subject, body, attachmentBuffer, filename = 'invoice.pdf') {
  return await sendEmail({
    to,
    subject,
    body,
    attachment: {
      filename,
      content: attachmentBuffer,
    },
  });
}

async function sendEmail({ to, subject, body, attachment = null }) {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  const mailOptions = {
    from: 'me',
    to,
    subject,
    text: body,
    headers: { 'X-Application-Name': 'TravelInsuranceBot' },
  };

  if (attachment) {
    mailOptions.attachments = [attachment];
  }

  const mail = mailcomposer(mailOptions);

  const compiled = await new Promise((resolve, reject) => {
    mail.build((err, message) => {
      if (err) reject(err);
      else resolve(message);
    });
  });

  const encodedMessage = Buffer.from(compiled)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  console.log(`📤 Email sent to ${to}${attachment ? ' (with attachment)' : ''}`);
}
