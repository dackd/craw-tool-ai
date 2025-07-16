const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");
const XLSX = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Crawler class (same as in index.js)
class ToolifyCrawler {
  constructor(targetUrl = null) {
    this.baseUrl = "https://www.toolify.ai";
    this.targetUrl =
      targetUrl || "https://www.toolify.ai/category/ai-background-remover";
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

  extractCategoryName(url) {
    const categoryMatch = url.match(/\/category\/([^\/\?]+)/);
    if (categoryMatch) {
      return categoryMatch[1].replace(/[^a-zA-Z0-9-]/g, "_");
    }
    return "unknown_category";
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

    let pageCount = 0;
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

      pageCount++;
      const pageActive = await page.$eval(
        this.pageActiveSelector,
        (el) => el.textContent
      );

      const nextButton = await page.$(this.nextButtonSelector);
      const isDisabled = await nextButton.evaluate((el) => el.disabled);
      if (nextButton && !isDisabled) {
        await nextButton.evaluate((el) => el.click());
        await this.sleep(5000);
      } else {
        break;
      }
    }

    const categoryName = this.extractCategoryName(this.targetUrl);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(this.products);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Tools");
    const filename = `${categoryName}.xlsx`;
    XLSX.writeFile(workbook, filename);

    await browser.close();

    return {
      success: true,
      filename: filename,
      totalProducts: this.products.length,
      categoryName: categoryName,
    };
  }
}

// Store file timers for auto-deletion
const fileTimers = new Map();

// Function to schedule file deletion
function scheduleFileDeletion(filename) {
  // Clear existing timer if any
  if (fileTimers.has(filename)) {
    clearTimeout(fileTimers.get(filename));
  }
  // Set new timer for 2 minutes (120000 ms)
  const timer = setTimeout(() => {
    const fs = require("fs");
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error auto-deleting file ${filename}:`, err);
        } else {
          console.log(`File ${filename} auto-deleted after 2 minutes`);
        }
      });
    }
    fileTimers.delete(filename);
  }, 120000); // 2 minutes

  fileTimers.set(filename, timer);
}

// Function to cancel file deletion (when user downloads)
function cancelFileDeletion(filename) {
  if (fileTimers.has(filename)) {
    clearTimeout(fileTimers.get(filename));
    fileTimers.delete(filename);
    console.log(`Auto-deletion cancelled for ${filename}`);
  }
}

// API endpoint for crawling
app.post("/crawl", async (req, res) => {
  try {
    const { targetUrl } = req.body;

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: "Target URL is required",
      });
    }

    // Validate URL format
    if (!targetUrl.includes("toolify.ai/category/")) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid Toolify.ai category URL",
      });
    }

    const crawler = new ToolifyCrawler(targetUrl);
    const result = await crawler.crawl();

    if (result.success && result.filename) {
      scheduleFileDeletion(result.filename);
    }

    res.json(result);
  } catch (error) {
    console.error("Crawling error:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred during crawling. Please try again.",
    });
  }
});

// API endpoint for downloading files
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, filename);

  // Check if file exists
  if (!require("fs").existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Cancel auto-deletion since user is downloading
  cancelFileDeletion(filename);

  // Set headers for file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // Stream the file and delete it after download
  const fileStream = require("fs").createReadStream(filePath);
  fileStream.pipe(res);

  // Delete file after download completes
  fileStream.on("end", () => {
    require("fs").unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log(`File ${filename} deleted successfully`);
      }
    });
  });

  fileStream.on("error", (err) => {
    console.error("Error streaming file:", err);
    res.status(500).json({ error: "Error downloading file" });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
