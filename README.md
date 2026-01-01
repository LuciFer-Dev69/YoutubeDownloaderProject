# 🎥 YouTube Video Downloader

A full-stack YouTube video downloader application with a modern, dark-themed UI and a powerful Node.js backend. Download YouTube videos in multiple qualities (144p to 4K) or extract audio as MP3.

![Video Hub](images/hahah.png)

## ✨ Features

- 🎬 **Multiple Quality Options**: Download videos from 144p to 4K (2160p)
- 🎵 **Audio Extraction**: Download audio as MP3 format
- 🎨 **Modern UI**: Clean, dark-themed interface with smooth animations
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast Downloads**: Direct streaming from YouTube servers
- 🔄 **Real-time Preview**: See video information before downloading
- 🛡️ **Error Handling**: Graceful fallback to alternative download services

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

### Installation

#### Option 1: Clone with Git

```bash
# Clone the repository
git clone https://github.com/LuciFer-Dev69/YoutubeDownloaderProject.git

# Navigate to the project directory
cd YoutubeDownloaderProject

# Install dependencies
npm install

# Start the server
npm start
```

#### Option 2: Download ZIP

1. Click the green **"Code"** button on GitHub
2. Select **"Download ZIP"**
3. Extract the ZIP file to your desired location
4. Open terminal/command prompt in the extracted folder
5. Run the following commands:

```bash
# Install dependencies
npm install

# Start the server
npm start
```

### 🎯 Usage

1. **Start the server** (if not already running):
   ```bash
   npm start
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

3. **Download a video**:
   - Paste a YouTube video URL into the input field
   - Click **"Fetch Video"** to load video information
   - Select your desired quality from the dropdown
   - Click **"Download Video"** to start the download
   - Check your browser's Downloads folder for the file

## 📁 Project Structure

```
YoutubeDownloaderProject/
├── images/              # Logo and assets
│   └── hahah.png       # Application logo
├── index.html          # Frontend HTML
├── script.js           # Frontend JavaScript logic
├── styles.css          # Frontend styling
├── server.js           # Backend API server
├── package.json        # Node.js dependencies
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern dark theme
- **JavaScript (ES6+)** - Client-side logic

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **@distube/ytdl-core** - YouTube download library (actively maintained)
- **CORS** - Cross-origin resource sharing

## 🔧 API Endpoints

### GET `/api/info`
Fetch video information and available formats.

**Query Parameters:**
- `url` (required): YouTube video URL

**Example:**
```
GET http://localhost:3000/api/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ
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
    "availableQualities": ["1080p", "720p", "480p", "360p", "mp3"]
  }
}
```

### GET `/api/download`
Download video or audio.

**Query Parameters:**
- `url` (required): YouTube video URL
- `quality` (optional): Quality selection (2160p, 1440p, 1080p, 720p, 480p, 360p, 240p, 144p, mp3)

**Example:**
```
GET http://localhost:3000/api/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&quality=720p
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "YouTube Downloader API is running",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## 💻 Development

### Running in Development Mode

For automatic server restart on file changes:

```bash
npm run dev
```

This uses `nodemon` to watch for file changes and automatically restart the server.

### Environment Variables

You can customize the server port by setting the `PORT` environment variable:

**Windows (PowerShell):**
```powershell
$env:PORT=8080; npm start
```

**Windows (CMD):**
```cmd
set PORT=8080 && npm start
```

**macOS/Linux:**
```bash
PORT=8080 npm start
```

## 🐛 Troubleshooting

### Server won't start
- **Check Node.js version**: Run `node --version` (should be v14+)
- **Reinstall dependencies**: Delete `node_modules` folder and run `npm install`
- **Port already in use**: Change the port using environment variable (see above)

### Download fails
- **Invalid URL**: Ensure you're using a valid YouTube video URL
- **Video unavailable**: Some videos may be age-restricted, region-locked, or private
- **Quality not available**: Try a different quality option
- **Network issues**: Check your internet connection

### "Module not found" error
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### CORS errors
- Ensure you're accessing the app through `http://localhost:3000`
- Don't use `file://` protocol - always use the server

## 📝 Notes

### Quality Availability
Not all videos have all quality options available. The application will only show qualities that YouTube provides for each specific video. Older videos may only have lower resolutions (240p, 360p).

### Legal Disclaimer
This tool is for **educational purposes only**. Please respect:
- YouTube's Terms of Service
- Copyright laws
- Content creators' rights

Only download videos you have permission to download or that are in the public domain.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for personal or educational purposes.

## 🙏 Acknowledgments

- **@distube/ytdl-core** - For the actively maintained YouTube download library
- **Express.js** - For the excellent web framework
- **YouTube** - For providing the platform

## 📞 Support

If you encounter any issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

**Made with ❤️ for educational purposes**

**Repository:** [https://github.com/LuciFer-Dev69/YoutubeDownloaderProject](https://github.com/LuciFer-Dev69/YoutubeDownloaderProject)
