// import fs from 'fs';
// import path from 'path';
// import csv from 'csv-parser';
// export function loadInsuranceData() {
//   return new Promise((resolve, reject) => {
//     const jsonFilePath = path.resolve('data', 'insurance_data.json');
//     console.log('File path:', filePath);
//     // Check if the JSON file exists
//     if (fs.existsSync(jsonFilePath)) {
//       // If the JSON file exists, read from it
//       fs.readFile(jsonFilePath, 'utf8', (err, data) => {
//         if (err) return reject(err);
//         resolve(JSON.parse(data));
//       });
//     } else {
//       // If the JSON file doesn't exist, parse the CSV and save the result to JSON
//       const results = [];
//       fs.createReadStream(path.resolve('data', 'insurance_data.csv'))
//         .pipe(csv())
//         .on('data', (data) => results.push(data))
//         .on('end', () => {
//           // Write the results to a JSON file for future use
//           fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
//           resolve(results);
//         })
//         .on('error', reject);
//     }
//   });
// }

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export async function loadInsuranceData() {
  const jsonFilePath = path.resolve('data', 'insurance_data.json');
  const csvFilePath = path.resolve('data', './insurance_data.csv');

  console.log('File path:', jsonFilePath);

  try {
    // Check if JSON already exists — load from it
    if (fs.existsSync(jsonFilePath)) {
      const data = await fs.promises.readFile(jsonFilePath, 'utf-8');
      return JSON.parse(data);
    }

    // If JSON doesn't exist, read from CSV and convert
    const results = await new Promise((resolve, reject) => {
      const dataArray = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => dataArray.push(data))
        .on('end', () => {
          try {
            fs.writeFileSync(jsonFilePath, JSON.stringify(dataArray, null, 2));
            resolve(dataArray);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', reject);
    });

    return results;

  } catch (err) {
    console.error('Error loading insurance data:', err);
    throw err;
  }
}

