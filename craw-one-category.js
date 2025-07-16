const puppeteer = require("puppeteer");
const XLSX = require("xlsx");

class ToolifyCrawler {
  constructor() {
    this.baseUrl = "https://www.toolify.ai";
    this.targetUrl = "https://www.toolify.ai/category/ai-blog-generator";
    this.toolPathSelector = ".card-text-content a";
    this.nextButtonSelector = ".btn-next";
    this.pageActiveSelector = ".el-pager .active";
    this.currentPage = 1;
    this.products = [];
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  trimName(name) {
    return name.replaceAll("\n", "").trim();
  }

  async checkCorrectPage(page) {
    const pageActive = await page.$eval(
      this.pageActiveSelector,
      (el) => el.textContent
    );
    console.log("pageActive: " + pageActive);
    console.log("currentPage: " + this.currentPage);
    if (pageActive == this.currentPage) {
      return;
    }
    this.sleep(1000);
    this.checkCorrectPage(page);
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
    while (true) {
      const tools = await page.$$(this.toolPathSelector);
      for (const tool of tools) {
        const path = await tool.evaluate((el) => el.href);
        const name = await tool.evaluate((el) => el.textContent);
        this.products.push({
          name: this.trimName(name),
          path,
        });
      }
      const nextButton = await page.$(this.nextButtonSelector);
      const isDisabled = await nextButton.evaluate((el) => el.disabled);
      if (nextButton && !isDisabled) {
        await nextButton.evaluate((el) => el.click());
        await this.sleep(5000);
      } else {
        break;
      }
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(this.products);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Tools");
    XLSX.writeFile(workbook, "toolPaths.xlsx");

    await browser.close();
  }
}

const crawler = new ToolifyCrawler();
crawler.crawl().catch((error) => {
  console.error("Error during crawling:", error);
});
