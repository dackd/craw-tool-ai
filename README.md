# Toolify Crawler Web Application

A web-based tool for crawling Toolify.ai categories and extracting tool information into Excel files.

## Features

- 🕷️ **Web Interface**: User-friendly web interface for entering target URLs
- 📊 **Excel Export**: Automatically generates Excel files with crawled data
- 🎨 **Modern UI**: Beautiful, responsive design with loading states
- ⚡ **Real-time Feedback**: Live status updates during crawling process
- 📥 **Auto Download**: Automatic file download after crawling completion

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the web server:

   ```bash
   npm start
   ```

2. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

3. Enter a Toolify.ai category URL in the input field

   - Example: `https://www.toolify.ai/category/ai-blog-generator`
   - Example: `https://www.toolify.ai/category/ai-writing-tools`

4. Click "Start Crawling" and wait for the process to complete

5. Once finished, click the download link to get your Excel file

## How It Works

The application uses:

- **Puppeteer**: For web scraping and browser automation
- **Express.js**: Web server framework
- **XLSX**: Excel file generation
- **Modern HTML/CSS/JS**: Responsive web interface

## File Structure

```
tool-ai-crawler/
├── server.js          # Express.js web server
├── crawler.js         # Main crawling logic
├── public/
│   └── index.html     # Web interface
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## API Endpoints

- `GET /` - Web interface
- `POST /crawl` - Start crawling process
- `GET /download/:filename` - Download generated Excel file

## Requirements

- Node.js (v14 or higher)
- npm or yarn
- Internet connection for crawling

## Troubleshooting

- Make sure the target URL is a valid Toolify.ai category page
- The crawling process may take several minutes depending on the number of pages
- If you encounter issues, check the browser console for error messages

## License

ISC
