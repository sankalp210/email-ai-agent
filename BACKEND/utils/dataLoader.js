
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

