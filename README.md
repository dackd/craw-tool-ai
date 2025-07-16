# Tool AI Crawler

A Node.js web crawler built with Puppeteer that extracts tool information from [Toolify.ai](https://www.toolify.ai) categories and exports the data to Excel files.

## Prerequisites

- Node.js (version 18.0.0 or higher)
- npm (comes with Node.js)

## Installation

### Step 1: Install Node.js

**Windows:**

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation by opening Command Prompt and running:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Project Dependencies

Navigate to your project directory and install dependencies:

```bash
npm install
```

## Usage

### Web Interface (Recommended)

Start the web server and use the beautiful UI:

```bash
npm run server
```

Then open your browser and go to: `http://localhost:3000`

The web interface provides:

- 🎨 **Beautiful UI** with modern design
- 📝 **Easy URL input** with validation
- 🔄 **Real-time progress** tracking
- 📊 **Instant results** display
- 📋 **Popular categories** with one-click selection

### Command Line Interface

Run the crawler with a specific category URL:

```bash
npm start <targetUrl>
```

### Examples

**Crawl AI Background Remover tools:**

```bash
npm start https://www.toolify.ai/category/ai-background-remover
```
