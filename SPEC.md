# Toolify AI Crawler Specification

## Project Overview

A Node.js-based web crawler designed to scrape AI tools and products from Toolify.ai. The crawler organizes the data by categories and groups, saving the results in Excel format.

## Technical Stack

- **Runtime**: Node.js
- **Dependencies**:
  - Puppeteer: For web scraping and browser automation
  - XLSX: For Excel file generation
  - fs: For file system operations
  - path: For path manipulation

## Features

### 1. Data Collection

- Crawls the Toolify.ai category page
- Extracts information from multiple categories
- Collects data from all groups within each category
- Handles pagination for product listings

### 2. Data Structure

Each product entry contains:

- Name
- Link
- Category
- Group

### 3. File Organization

- Creates a `results` directory in the project root
- Organizes Excel files by category in subdirectories
- File naming convention: `[group_name].xlsx`
- Special characters in filenames are replaced with underscores

### 4. Browser Configuration

- Uses headless browser mode
- Implements custom user agent
- Sets viewport to 1920x1080
- Includes error handling for navigation and element selection

## Implementation Details

### Class Structure

```javascript
class ToolifyCrawler {
  // Selectors for web elements
  // Browser configuration
  // Data storage
}
```

### Key Methods

1. `crawl()`: Main crawling logic
2. `saveToExcel()`: Data export functionality
3. `trimName()`: Filename sanitization
4. `sleep()`: Delay implementation

### Error Handling

- Navigation errors
- Element selection failures
- File system operations
- Network timeouts

## Output Format

- Excel files (.xlsx)
- Organized by category in subdirectories
- Each file contains products from a specific group

## Directory Structure

```
project/
├── results/
│   ├── [Category1]/
│   │   ├── [Group1].xlsx
│   │   └── [Group2].xlsx
│   └── [Category2]/
│       ├── [Group1].xlsx
│       └── [Group2].xlsx
├── index.js
├── package.json
└── SPEC.md
```

## Usage

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the crawler:
   ```bash
   node index.js
   ```

## Performance Considerations

- Implements sleep delays between requests
- Handles pagination efficiently
- Manages browser resources properly

## Future Enhancements

1. Parallel processing for faster crawling
2. Resume capability for interrupted crawls
3. Data validation and cleaning
4. Progress tracking and reporting
5. Configurable output formats
6. Rate limiting and proxy support

## Limitations

- Single-threaded execution
- Sequential category processing
- No automatic retry mechanism
- Limited error recovery

## Dependencies

```json
{
  "dependencies": {
    "puppeteer": "^21.0.0",
    "xlsx": "^0.18.0"
  }
}
```
