const express = require("express");
const path = require("path");
const fs = require("fs");
const ToolifyCrawler = require("./crawler");

const app = express();
const PORT = process.env.PORT || 8080;

// Store file cleanup timers
const fileCleanupTimers = new Map();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Function to schedule file deletion
function scheduleFileDeletion(filename, delayMs = 60000) {
  // 1 minute default
  const timer = setTimeout(() => {
    deleteFile(filename);
  }, delayMs);

  fileCleanupTimers.set(filename, timer);
}

// Function to delete file
function deleteFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filename}`);
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
    }
  }

  // Clear the timer
  const timer = fileCleanupTimers.get(filename);
  if (timer) {
    clearTimeout(timer);
    fileCleanupTimers.delete(filename);
  }
}

// Function to validate URL
function validateUrl(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  if (!url.startsWith("https://www.toolify.ai/category/")) {
    return {
      valid: false,
      error: "URL must start with 'https://www.toolify.ai/category/'",
    };
  }

  return { valid: true };
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/crawl", async (req, res) => {
  try {
    const { targetUrl } = req.body;

    // Validate URL
    const validation = validateUrl(targetUrl);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Create crawler instance with user-provided URL
    const crawler = new ToolifyCrawler(targetUrl);

    // Start crawling
    const filename = await crawler.crawl();

    // Schedule file deletion after 1 minute
    scheduleFileDeletion(filename, 60000);

    // Return success with filename
    res.json({
      success: true,
      message: "Crawling completed successfully!",
      filename: filename,
      downloadUrl: `/download/${filename}`,
    });
  } catch (error) {
    console.error("Error during crawling:", error);
    res.status(500).json({
      error: "An error occurred during crawling",
      details: error.message,
    });
  }
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, filename);

  if (fs.existsSync(filePath)) {
    // Clear the existing timer and set a new one for immediate deletion after download
    const existingTimer = fileCleanupTimers.get(filename);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ error: "Download failed" });
      } else {
        // Delete file immediately after successful download
        setTimeout(() => {
          deleteFile(filename);
        }, 1000); // Small delay to ensure download completes
      }
    });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Cleanup on server shutdown
process.on("SIGINT", () => {
  console.log("Cleaning up files...");
  fileCleanupTimers.forEach((timer, filename) => {
    clearTimeout(timer);
    deleteFile(filename);
  });
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
