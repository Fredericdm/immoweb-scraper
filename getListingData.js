var timeout = 0;
var index = null;
var indexLimit = null;
var allData = null;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
var fs = require("fs");
async function run() {
  puppeteer
    .launch({
      headless: true,
      slowMo: 250,
      defaultViewport: null,
      executablePath: require("puppeteer").executablePath(),
      args: ["--no-sandbox", "--start-maximized"],
      devtools: false,
    })
    .then(async (b) => {
      browser = b;
      console.log("#################");
      console.log("Starting Browser...");
      console.log("With document : " + index);
      console.log("#################");
      page = (await browser.pages())[0];
      await page.setDefaultNavigationTimeout(0);
      await page.setRequestInterception(true);
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
      );

      page.on("request", (request) => {
        if (
          // request.url().indexOf("googletagmanager") > -1 ||
          // request.url().indexOf("google-analytics") > -1 ||
          // request.url().indexOf("js.monitor.azure.com") > -1 ||
          // request.url().indexOf("gstatic.com/recaptcha/") > -1 ||
          // request.url().indexOf("google.com/recaptcha") > -1 ||
          // request.url().indexOf("appinsights") > -1 ||
          // request.resourceType() === "image" ||
          // request.resourceType() === "stylesheet" ||
          // request.resourceType() === "font"
          false
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });

      await page.goto(
        "https://www.immoweb.be/en/classified/apartment/for-sale/mechelen/2800/11444073",
        {
          waitUntil: "load",
          timeout: 0,
        }
      );

      scrape();
    });
}

extractElementFromPage = async () => {
  return await page.evaluate(() => {
    return new Promise(async (resolve) => {
      var jsonData = {};
      function convertHtmlToJson1() {
        const sections = document.querySelectorAll(".accordion--section");
        const result = [];

        sections.forEach((section) => {
          const rows = section.querySelectorAll(
            "tbody.classified-table__body tr"
          );

          rows.forEach((row) => {
            const header = row
              .querySelector("th")
              ?.innerText.trim()
              ?.replace(/\s+/g, " ")
              .trim();
            const data = row
              .querySelector("td")
              ?.innerText.trim()
              ?.replace("square meters", "")
              ?.replace("square meter", "")
              .replace("kilowatt hour per", "")
              .replace("vierkante meters", "")
              .replace("kilowattuur per vierkante meters", "")
              .replace("vierkante meter", "")
              .replace("kilowattuur per", "")
              .replace(/\s+/g, " ")
              .trim();
            jsonData[header] = data;
          });
        });

        return result;
      }

      // Appeler la fonction et afficher le résultat
      convertHtmlToJson1();

      // Fonction pour convertir les éléments HTML en JSON
      function convertHtmlToJson() {
        const section = document.querySelector(".classified__section");
        if (!section) {
          return {};
        }

        const result = {};
        const titleElement = section.querySelector(".text-block__title");
        if (titleElement) {
          result.title = titleElement.innerText.trim();
        }

        const overviewItems = section.querySelectorAll(".overview__item");
        overviewItems.forEach((item) => {
          const textElement = item.querySelector(".overview__text");
          if (textElement) {
            const text = textElement.innerText.trim();
            if (text.includes("bedrooms")) {
              result.bedrooms = parseInt(text.split(" ")[0]);
            } else if (text.includes("bathroom")) {
              result.bathrooms = parseInt(text.split(" ")[0]);
            } else if (text.includes("livable space")) {
              result.livable_space = parseInt(text.split(" ")[0]);
            } else if (text.includes("of land")) {
              result.of_land = parseInt(text.split(" ")[0]);
            } else if (text.includes("Floor")) {
              result.Floor = parseInt(text.split(" ")[0]);
            } else if (text.includes("slaapkamers")) {
              result.slaapkamers = parseInt(text.split(" ")[0]);
            }
          } else if (text.includes("grond")) {
            result.badkamers = parseInt(text.split(" ")[0]);
          } else if (text.includes("badkamers")) {
            result.badkamers = parseInt(text.split(" ")[0]);
          } else if (text.includes("bewoonbare ruimte")) {
            result.bewoonbareRuimte = parseInt(text.split(" ")[0]);
          }
        });

        return result;
      }

      // Appeler la fonction et afficher le résultat
      jsonData = { ...convertHtmlToJson(), ...jsonData };
      delete jsonData.undefined;
      delete jsonData.title;
      delete jsonData[""];
      jsonData["description"] = document
        .querySelector(".classified__description")
        ?.innerText?.replace(/\s+/g, " ")
        .trim();
      jsonData["link"] = window.location.href;
      jsonData["immowebCode"] = window.location.href.split("/").pop();
      jsonData["Price"] = jsonData["Price"]?.split(" ")?.slice(2, 4).join(" ");
      jsonData["Prijs"] = jsonData["Prijs"]?.split(" ")?.slice(2, 4).join(" ");
      jsonData["Cadastral income"] = jsonData["Cadastral income"]
        ?.split(" ")
        ?.slice(2, 4)
        .join(" ");
      jsonData["Kadastraal inkomen"] = jsonData["Kadastraal inkomen"]
        ?.split(" ")
        ?.slice(2, 4)
        .join(" ");
      let json = document
        .querySelector("#container-main-content > div.classified > script")
        .innerHTML.trim()
        .split("window.classified = ")[1]
        .split(";\n            /* START: AB")[0];
      json = JSON.parse(json);
      let addressData = {};
      Object.keys(json.property.location).forEach(
        (e) => (addressData["adress_" + e] = json.property.location[e])
      );
      jsonData = { ...jsonData, ...addressData };
      let images = json.media.pictures.map((e, i) => {
        jsonData["image " + (i + 1)] = e.largeUrl;
        return e.largeUrl;
      });

      console.log(jsonData);

      let data = jsonData;

      return resolve(data);
    });
  });
};

async function autoScroll() {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 100; // distance to scroll each step in pixels
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50); // time between scrolls in milliseconds
    });
  });
}

scrape = async () => {
  try {
    if (index < indexLimit) {
      //   console.log(new Date().toLocaleString() + " Asking for Id: " + index);
      console.log(allData[index]);
      await page.goto(allData[index], {
        waitUntil: "load",
        timeout: 0,
      });

      // await autoScroll( );

      var data = await extractElementFromPage();
      index = index + 1;
      fs.writeFileSync(`./currentIndex_Links.txt`, `${index}`);
      fs.writeFileSync(
        `./jsons/${index}.json`,
        data ? JSON.stringify(data) : ""
      );
      console.log(
        new Date().toLocaleString() +
          " Downloaded   : " +
          JSON.stringify(data).length +
          " : " +
          index +
          " / " +
          indexLimit +
          "  " +
          (data && Object.keys(data).length ? "- Full" : "- Empty")
      );
      await page.waitForTimeout(timeout);
      await scrape();
    } else {
      await browser.close();
      console.log("#################");
      console.log("Done");
      process.exit(0);
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

fs.readFile("./currentIndex_Links.txt", (err, current) => {
  if (err) {
    throw err;
  }

  fs.readFile("./data.json", (err, json) => {
    if (err) {
      throw err;
    }
    allData = JSON.parse(json);
    if (!allData.length) {
      console.log("No data given");
      process.exit(0);
    } else {
      indexLimit = allData.length - 1;
    }

    if (!current.length) current = 0;
    index = parseInt(current);
    run();
  });
});
