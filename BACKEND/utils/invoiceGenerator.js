

// import PDFDocument from 'pdfkit';
// import getStream from 'get-stream';

// export async function generateInvoicePDF(emailText, dataset) {
//   const doc = new PDFDocument();

//   doc.fontSize(20).text('Travel Insurance Claim Invoice', { align: 'center' });
//   doc.moveDown();

//   // Fill with dummy or extracted data
//   doc.fontSize(12).text(`Customer: Extracted from email`);
//   doc.text(`Product: Travel Protect Gold`);
//   doc.text(`Amount: SGD 120.00`);
//   doc.text(`Commission: SGD 12.00`);
//   doc.text(`Status: Approved`);
//   doc.end();

//   return await getStream(doc); // returns a Buffer
// }


import PDFDocument from 'pdfkit';
import getStream from 'get-stream';  // Ensure get-stream is correctly installed

export async function generateInvoicePDF(emailText, dataset) {
  const doc = new PDFDocument();
  const buffers = [];

  // Capture data as it's written
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // Fill with dummy or extracted data
  doc.fontSize(20).text('Travel Insurance Claim Invoice', { align: 'center' });
  doc.moveDown();

  // Assuming 'emailText' contains extracted data or dummy data
  doc.fontSize(12).text(`Customer: Extracted from email`);
  doc.text(`Product: Travel Protect Gold`);
  doc.text(`Amount: SGD 120.00`);
  doc.text(`Commission: SGD 12.00`);
  doc.text(`Status: Approved`);

  // Finalize the PDF
  doc.end();

  // Wait for the stream to be fully captured
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);  // Combine chunks into one Buffer
      resolve(pdfBuffer);  // Return the complete PDF buffer
    });
    
    // If there's an error, reject the promise
    doc.on('error', reject);
  });
}
