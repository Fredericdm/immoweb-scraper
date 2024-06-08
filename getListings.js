var basePath = "https://www.immoweb.be/en/search/house/for-sale?countries=BE&provinces=ANTWERP,FLEMISH_BRABANT&priceType=SALE_PRICE&orderBy=relevance&page="
var timeout = 0;
var index = null;
var indexLimit = null;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
var allData = []
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
          request.url().indexOf("googletagmanager") > -1 ||
          request.url().indexOf("google-analytics") > -1 ||
          request.url().indexOf("js.monitor.azure.com") > -1 ||
          request.url().indexOf("gstatic.com/recaptcha/") > -1 ||
          request.url().indexOf("google.com/recaptcha") > -1 ||
          request.url().indexOf("appinsights") > -1
          ||
          request.resourceType() === "image" ||
          request.resourceType() === "stylesheet" ||
          request.resourceType() === "font"
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });

      await page.goto(
        basePath +"1",
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

      let listings =  [...document.querySelectorAll(".card--result__body .card__title-link")];
    console.log(listings)
    let data = listings.map((l) => {
      return  l.href 
       
    })
      return resolve( 
        data 
       );
    });
  });
};

 

scrape = async () => {
  try {
    if (index < indexLimit) {
      //   console.log(new Date().toLocaleString() + " Asking for Id: " + index);

      await page.goto(
        basePath + index,
        {
          waitUntil: "load",
          timeout: 0,
        }
      );
      var data =  await extractElementFromPage()
      index = index + 1;
      fs.writeFileSync(`./currentIndex_Links.txt`, `${index}`);
      allData = [...allData,...data]
      console.log(
        new Date().toLocaleString() +
          " Downloaded   : " +
          data.length +
          " : " +
          index +
          " / " +
          indexLimit +
          "  " +
          (data && Object.keys(data).length ? "- Full" : "- Empty" )+   " " +allData.length
      );
      await page.waitForTimeout(timeout);
      await scrape();
    } else {
      await browser.close();
      console.log("#################");
      console.log("Done");
      fs.writeFileSync(`./data.json`, `${JSON.stringify(allData)}`);

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

  fs.readFile("./limit.txt", (err, limit) => {
    if (err) {
      throw err;
    }
  
    if (!limit.length) {
      console.log(
        "No limit given"
      );
      process.exit(0);
    } else {
      indexLimit = parseInt(limit) ;
    }

    if (!current.length) current = 0;
    index = parseInt(current);
    run();
  });
});
 