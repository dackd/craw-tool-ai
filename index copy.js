const puppeteer = require("puppeteer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

class ToolifyCrawler {
  constructor() {
    this.baseUrl = "https://www.toolify.ai";
    this.targetUrl = "https://www.toolify.ai/category";
    this.categorySelector = ".list > div";
    this.categoryNameSelector = "h3";
    this.groupSelector = "a.go-category-link";
    this.groupNameSelector = ".go-category-link > span";
    this.productSelector = ".tool-card";
    this.productNameSelector = "a > h2";
    this.productLinkSelector = "a[rel='dofollow']";
    this.nextButtonSelector = ".btn-next";
    this.products = [];
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  trimName(name) {
    return name.replaceAll("\n", "").trim();
  }

  async saveToExcel(data, name, categoryName) {
    // Create directory if it doesn't exist
    const folderPath = path.join(process.cwd(), "results/", categoryName);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 30));
    XLSX.writeFile(
      workbook,
      `${folderPath}/${this.trimName(name).replaceAll(" ", "_")}.xlsx`
    );
  }

  async crawl() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    // Set viewport to a common desktop resolution
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.goto(this.targetUrl);

    const categories = await page.$$(this.categorySelector);
    console.log("categories founded " + categories.length + " items");
    for (const category of categories) {
      // get h3 element inside category
      const categoryName = await category.$eval(
        this.categoryNameSelector,
        (el) => el.textContent
      );
      console.log("category: " + categoryName);
      if (categoryName !== "Image Generation & Editing") continue;
      const groups = await category.$$(this.groupSelector);
      const groupsLinks = await Promise.all(
        groups.map((group) =>
          group.evaluate((el) => ({
            link: el.href,
            name: el.querySelector("span").textContent,
          }))
        )
      );

      for (const group of groupsLinks) {
        await page.goto(group.link);
        console.log("group: " + group.name);
        // save group name to excel

        while (true) {
          const products = await page.$$(this.productSelector);

          for (const product of products) {
            const productName = await product.$eval(
              this.productNameSelector,
              (el) => el.textContent
            );
            const link = await product.$eval(
              this.productLinkSelector,
              (el) => el.href
            );
            const productResult = {
              name: productName,
              link,
              category: categoryName,
              group: this.trimName(group.name),
            };
            this.products.push(productResult);
            console.log(this.products.length);
          }

          // check if next button disabled
          const nextButton = await page.$(this.nextButtonSelector);
          const isDisabled = await nextButton.evaluate((el) => el.disabled);
          if (nextButton && !isDisabled) {
            await nextButton.evaluate((el) => el.click());
            await this.sleep(1000);
          } else {
            //
            break;
          }
        }

        await this.saveToExcel(this.products, group.name, categoryName);
        console.log("done " + group.name);
        this.products = [];
      }
    }

    await browser.close();
  }
}

const crawler = new ToolifyCrawler();
crawler.crawl().catch((error) => {
  console.error("Error during crawling:", error);
});
