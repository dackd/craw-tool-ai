const puppeteer = require("puppeteer");
const XLSX = require("xlsx");

class ToolifyCrawler {
  constructor(targetUrl) {
    this.baseUrl = "https://www.toolify.ai";
    this.targetUrl =
      targetUrl || "https://www.toolify.ai/category/ai-blog-generator";
    this.toolPathSelector = ".card-text-content a";
    this.nextButtonSelector = ".btn-next";
    this.pageActiveSelector = ".el-pager .active";
    this.currentPage = 1;
    this.products = [];
  }

  validateUrl(url) {
    if (!url.startsWith("https://www.toolify.ai/category/")) {
      throw new Error("URL must start with 'https://www.toolify.ai/category/'");
    }
    return true;
  }

  extractCategoryName(url) {
    // Extract category name from URL like "ai-blog-generator" from "https://www.toolify.ai/category/ai-blog-generator"
    const categoryMatch = url.match(/\/category\/([^\/\?]+)/);
    if (categoryMatch) {
      return categoryMatch[1].replace(/[^a-zA-Z0-9-]/g, "_");
    }
    return "unknown_category";
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  trimName(name) {
    return name.replaceAll("\n", "").trim();
  }

  async crawl() {
    // Validate URL first
    this.validateUrl(this.targetUrl);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
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

    try {
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

      // Generate filename with category name
      const categoryName = this.extractCategoryName(this.targetUrl);

      const filename = `${categoryName}.xlsx`;

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(this.products);

      XLSX.utils.book_append_sheet(workbook, worksheet, "Tools");
      XLSX.writeFile(workbook, filename);

      await browser.close();
      return filename;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }
}

module.exports = ToolifyCrawler;
