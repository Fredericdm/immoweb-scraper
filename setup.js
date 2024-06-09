const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Function to run npm install in the immoweb-main directory
function installDependencies() {
  return new Promise((resolve, reject) => {
    const homeDir = os.homedir();
    const immowebMainPath = path.join(homeDir, 'Desktop', 'immoweb-main');
    
    exec('npm install', { cwd: immowebMainPath }, (error, stdout, stderr) => {
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

// Function to create an empty subfolder named 'jsons' inside 'immoweb-main' folder on the user's desktop
function createJsonsFolder() {
  const homeDir = os.homedir();
  const immowebMainPath = path.join(homeDir, 'Desktop', 'immoweb-main');
  const folderPath = path.join(immowebMainPath, 'jsons');

  if (!fs.existsSync(immowebMainPath)) {
    fs.mkdirSync(immowebMainPath, { recursive: true });
    console.log('Created immoweb-main folder on the Desktop');
  } else {
    console.log('immoweb-main folder already exists on the Desktop');
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log('Created jsons folder inside immoweb-main on the Desktop');
  } else {
    console.log('jsons folder already exists inside immoweb-main on the Desktop');
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
