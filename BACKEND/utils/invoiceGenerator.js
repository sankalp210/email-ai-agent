

import PDFDocument from 'pdfkit';
import getStream from 'get-stream';

export async function generateInvoicePDF(emailText, dataset, extractedData = {}) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];
  console.log(extractedData);
  

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(24).font('Helvetica-Bold').text('Travel Insurance Claim Invoice', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(14).font('Helvetica').text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(0.5);

  doc.fontSize(16).font('Helvetica-Bold').text('Claim Overview', { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica').text(`Customer Name: ${extractedData.name || 'N/A'}`);
  doc.text(`Age: ${extractedData.age || 'N/A'}`);
  doc.text(`Gender: ${extractedData.gender || 'N/A'}`);
  doc.text(`Destination: ${extractedData.destination || 'N/A'}`);
  doc.text(`Duration: ${extractedData.duration || 'N/A'} days`);
  doc.text(`Product: ${extractedData.product || 'N/A'}`);
  doc.moveDown(1);

  doc.fontSize(14).font('Helvetica-Bold').text('Policy & Sales Info', { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica').text(`Agency: ${extractedData.agency || 'N/A'}`);
  doc.text(`Agency Type: ${extractedData.agencyType || 'N/A'}`);
  doc.text(`Distribution Channel: ${extractedData.channel || 'N/A'}`);
  doc.text(`Net Sales: SGD ${extractedData.netSales || '0.00'}`);
  doc.text(`Commission: SGD ${extractedData.commission || '0.00'}`);
  doc.moveDown(1);

  doc.fontSize(14).font('Helvetica-Bold').text('Claim Status', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(`Status: Approved`);
  // doc.text(`Invoice Amount: SGD 120.00`);

  doc.moveDown(2);
  doc.fontSize(10).font('Helvetica-Oblique').text('Thank you for choosing Travel Protect Gold!', { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);
  });
}
