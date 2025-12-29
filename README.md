# YouTube Video Downloader

A full-stack YouTube video downloader application with a modern frontend and Node.js backend API.

## Features

- 🎥 Download YouTube videos in multiple qualities (144p to 4K)
- 🎵 Download audio as MP3
- 📱 Responsive, modern UI
- ⚡ Fast and reliable downloads
- 🔒 Secure API endpoints
- 📊 Real-time video information display

## Architecture

- **Frontend**: Pure HTML/CSS/JavaScript
- **Backend**: Node.js + Express + ytdl-core
- **API**: RESTful endpoints for video info and downloads

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### GET /api/info
Get video information and available formats.

**Query Parameters:**
- `url` (required): YouTube video URL

**Example:**
```
GET /api/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Video Title",
    "duration": "212",
    "channel": "Channel Name",
    "thumbnail": "https://...",
    "formats": [...],
    "availableQualities": ["2160p", "1080p", "720p", "mp3"]
  }
}
```

### GET /api/download
Download video or audio.

**Query Parameters:**
- `url` (required): YouTube video URL
- `quality` (optional): Quality selection (2160p, 1440p, 1080p, 720p, 480p, 360p, 240p, 144p, mp3)
- `itag` (optional): Specific format itag

**Example:**
```
GET /api/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&quality=1080p
```

**Response:**
Streams the video/audio file directly to the browser.

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "YouTube Downloader API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Project Structure

```
youtube-downloader/
├── server.js          # Backend API server
├── package.json       # Node.js dependencies
├── index.html         # Frontend HTML
├── styles.css         # Frontend styles
├── script.js          # Frontend JavaScript
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Usage

1. Enter a YouTube video URL in the input field
2. Click "Fetch Video" to get video information
3. Select your desired quality from the dropdown
4. Click "Download Video" to start the download

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Environment Variables

You can set the following environment variables:

- `PORT`: Server port (default: 3000)

Example:
```bash
PORT=8080 npm start
```

## Deployment

### Local Deployment

1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Access at `http://localhost:3000`

### Cloud Deployment

This application can be deployed to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS
- Any Node.js hosting platform

Make sure to:
1. Set the `PORT` environment variable if required by your hosting platform
2. Ensure Node.js 14+ is available
3. Install dependencies during deployment

## Troubleshooting

### Download fails
- Check if the video URL is valid
- Ensure the video is not age-restricted or region-locked
- Try a different quality option

### Server won't start
- Verify Node.js version (v14+)
- Run `npm install` to ensure all dependencies are installed
- Check if port 3000 is available

### CORS errors
- Ensure the frontend and backend are on the same origin, or
- Configure CORS settings in `server.js` if using separate origins

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Disclaimer

This tool is for educational purposes. Please respect YouTube's Terms of Service and copyright laws. Only download videos you have permission to download.

# YoutubeDownloaderProject
