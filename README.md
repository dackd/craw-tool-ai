# Tool AI Crawler

A web-based tool crawler for scraping toolify.ai categories with a user interface.

## Features

- Web-based interface for crawling toolify.ai categories
- Exports data to Excel format
- Automatic file cleanup
- Docker support for cloud deployment

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open http://localhost:8080 in your browser

## Docker Deployment

### Local Docker Build

1. Build the Docker image:

   ```bash
   docker build -t tool-ai-crawler .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 tool-ai-crawler
   ```

### Google Cloud Run Deployment

#### Option 1: Using Cloud Build (Recommended)

1. Enable required APIs:

   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   ```

2. Deploy using Cloud Build:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

#### Option 2: Manual Deployment

1. Build and push to Container Registry:

   ```bash
   docker build -t gcr.io/[PROJECT-ID]/tool-ai-crawler .
   docker push gcr.io/[PROJECT-ID]/tool-ai-crawler
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy tool-ai-crawler \
     --image gcr.io/[PROJECT-ID]/tool-ai-crawler \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2 \
     --timeout 900 \
     --max-instances 10
   ```

## Configuration

The application uses the following environment variables:

- `PORT`: Server port (default: 8080)

## Architecture

- **Frontend**: Static HTML/CSS/JS served by Express
- **Backend**: Node.js with Express
- **Web Scraping**: Puppeteer for browser automation
- **Data Export**: XLSX for Excel file generation

## Security Notes

- The application runs as a non-root user in the container
- Files are automatically cleaned up after download
- Input validation is performed on URLs
