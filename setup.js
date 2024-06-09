const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Function to run npm install
function installDependencies() {
  return new Promise((resolve, reject) => {
    exec('npm install', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during npm install: ${error}`);
        reject(error);
      } else {
        console.log('npm install completed successfully');
        resolve(stdout);
      }
    });
  });
}

// Function to create an empty subfolder named 'jsons' inside 'immoweb' folder on the user's desktop
function createJsonsFolder() {
  const homeDir = os.homedir();
  const immowebPath = path.join(homeDir, 'Desktop', 'immoweb');
  const folderPath = path.join(immowebPath, 'jsons');

  if (!fs.existsSync(immowebPath)) {
    fs.mkdirSync(immowebPath, { recursive: true });
    console.log('Created immoweb folder on the Desktop');
  } else {
    console.log('immoweb folder already exists on the Desktop');
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log('Created jsons folder inside immoweb on the Desktop');
  } else {
    console.log('jsons folder already exists inside immoweb on the Desktop');
  }
}

// Main function to run the tasks
async function main() {
  try {
    await installDependencies();
    createJsonsFolder();
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Execute the main function
main();
