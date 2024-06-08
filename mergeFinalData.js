const inputfolder = "./jsons/";
const fs = require("fs");
var Files;
var input_stream = fs.createWriteStream("immoweb_merged.json", { flags: "a" });
input_stream.write("[");

fs.readdir(inputfolder, (err, files) => {
  if (err) {
    console.log("Error reading directory:", err);
    return;
  }

  Files = files;
  console.log("Found " + Files.length + " Total Files in " + inputfolder);
  if (Files.length === 0) {
    input_stream.write("]");
    input_stream.end();
  } else {
    readFileContent(0);
  }
});

const readFileContent = (index) => {
  fs.readFile(inputfolder + Files[index], "utf8", function read(err, content) {
    if (err) {
      console.log("Error reading file:", err);
      throw err;
    }

    if (content) {
      try {
        content = JSON.parse(content);
        input_stream.write(JSON.stringify(content));
        if (index < Files.length - 1) {
          input_stream.write(",");
        }
      } catch (error) {
        console.log("Error parsing JSON:", error);
      }
    }

    if (index < Files.length - 1) {
      readFileContent(index + 1);
    } else {
      input_stream.write("]");
      input_stream.end();
      console.log("Done");
    }
  });
};
