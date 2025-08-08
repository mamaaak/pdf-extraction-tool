/**
 * Download Sample Mississippi Watershed Plans for Testing
 * 
 * This script downloads sample watershed plans from the Mississippi DEQ website
 * and stores them in the test/data directory for accuracy testing.
 * 
 * Usage: node downloadSamplePlans.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// Configuration
const downloadDir = path.join(__dirname, '../data');
const samplePlans = [
  {
    name: 'Deer Creek Watershed Plan',
    url: 'https://www.mdeq.ms.gov/wp-content/uploads/MDEQ%20Deer%20Creek%20Final%20Watershed%20Implementation%20Plan%20July%202018.pdf'
  },
  {
    name: 'Harris Bayou Watershed Plan',
    url: 'https://www.mdeq.ms.gov/wp-content/uploads/Harris-Bayou-Watershed-Implementation-Plan.pdf'
  },
  {
    name: 'Porters Bayou Watershed Plan',
    url: 'https://www.mdeq.ms.gov/wp-content/uploads/2017/06/WRMP_PortersBayouFinal_Nov2016.pdf'
  },
  {
    name: 'Red Banks Watershed Plan',
    url: 'https://www.mdeq.ms.gov/wp-content/uploads/Red-Banks-Watershed-Implementation-Plan.pdf'
  },
  {
    name: 'Turkey Creek Watershed Plan',
    url: 'https://www.mdeq.ms.gov/wp-content/uploads/Turkey-Creek-Watershed-Implementation-Plan_FINAL-1.pdf'
  }
];

/**
 * Downloads a file from a URL and saves it to disk
 * @param {string} url - The URL to download
 * @param {string} destPath - The destination file path
 * @returns {Promise<void>}
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    // Create a write stream
    const file = fs.createWriteStream(destPath);
    
    // Request the file
    https.get(url, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: HTTP status ${response.statusCode}`));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(file);
      
      // When the file is done writing
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      // Delete the file if an error occurs
      fs.unlink(destPath, () => {});
      reject(err);
    });
    
    // Handle errors with the file
    file.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Main function to download all sample plans
 */
async function downloadSamplePlans() {
  console.log('='.repeat(80));
  console.log('DOWNLOADING SAMPLE MISSISSIPPI WATERSHED PLANS');
  console.log('='.repeat(80));
  
  // Ensure the download directory exists
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
    console.log(`Created directory: ${downloadDir}`);
  }
  
  console.log(`Found ${samplePlans.length} sample plans to download.\n`);
  
  // Download each plan
  for (const plan of samplePlans) {
    try {
      // Create a sanitized filename from the URL
      const urlObj = new URL(plan.url);
      const fileName = path.basename(urlObj.pathname)
        .replace(/%20/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .toLowerCase();
        
      const destPath = path.join(downloadDir, fileName);
      
      // Check if file already exists
      if (fs.existsSync(destPath)) {
        console.log(`${plan.name}: Already downloaded [${fileName}]`);
        continue;
      }
      
      console.log(`Downloading ${plan.name}...`);
      await downloadFile(plan.url, destPath);
      console.log(`  Saved to ${destPath}`);
    } catch (error) {
      console.error(`Error downloading ${plan.name}:`, error.message);
    }
  }
  
  console.log('\nDownload process completed.');
  
  // List downloaded files
  const files = fs.readdirSync(downloadDir)
    .filter(file => file.toLowerCase().endsWith('.pdf'));
  
  if (files.length > 0) {
    console.log('\nAvailable test files:');
    files.forEach(file => console.log(`- ${file}`));
  } else {
    console.log('\nNo PDF files found in the download directory!');
  }
}

// Run the download when script is executed directly
if (require.main === module) {
  downloadSamplePlans();
}

module.exports = { downloadSamplePlans };