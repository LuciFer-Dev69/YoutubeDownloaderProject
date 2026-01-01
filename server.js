/**
 * YouTube Video Downloader - Backend API Server
 * 
 * This server provides API endpoints for:
 * - Fetching video information
 * - Downloading videos in various qualities
 * - Downloading audio (MP3)
 */

const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));

// Serve frontend files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * GET /api/info - Get video information
 * Query params: url (YouTube URL)
 */
app.get('/api/info', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL is required'
            });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL'
            });
        }

        // Get video info
        const info = await ytdl.getInfo(url);

        // Extract available formats
        const formats = info.formats
            .filter(format => format.hasVideo || format.hasAudio)
            .map(format => ({
                itag: format.itag,
                quality: format.qualityLabel || format.audioQuality || 'audio',
                container: format.container,
                hasVideo: format.hasVideo,
                hasAudio: format.hasAudio,
                url: format.url
            }));

        // Response
        res.json({
            success: true,
            data: {
                videoId: info.videoDetails.videoId,
                title: info.videoDetails.title,
                description: info.videoDetails.description,
                duration: info.videoDetails.lengthSeconds,
                channel: info.videoDetails.author.name,
                thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
                formats: formats,
                availableQualities: getAvailableQualities(formats)
            }
        });

    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch video information'
        });
    }
});

/**
 * GET /api/download - Download video/audio
 * Query params: 
 *   - url (YouTube URL)
 *   - quality (optional: 2160p, 1440p, 1080p, 720p, 480p, 360p, 240p, 144p, mp3)
 *   - itag (optional: specific format itag)
 */
app.get('/api/download', async (req, res) => {
    try {
        const { url, quality, itag } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL is required'
            });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL'
            });
        }

        console.log(`Download request - URL: ${url}, Quality: ${quality}`);

        // Get video info
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').substring(0, 100);

        let format;
        let filename;
        let contentType;

        if (quality === 'mp3' || quality === 'audio') {
            // Audio only download
            console.log('Downloading audio only...');

            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            if (audioFormats.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No audio formats available'
                });
            }

            // Get highest quality audio
            format = audioFormats.reduce((best, current) => {
                const bestBitrate = best.audioBitrate || 0;
                const currentBitrate = current.audioBitrate || 0;
                return currentBitrate > bestBitrate ? current : best;
            });

            filename = `${title}.mp3`;
            contentType = 'audio/mpeg';

            console.log(`Selected audio format - Bitrate: ${format.audioBitrate}kbps`);

        } else if (itag) {
            // Specific format by itag
            format = info.formats.find(f => f.itag === parseInt(itag));
            if (!format) {
                return res.status(400).json({
                    success: false,
                    error: 'Format not available'
                });
            }
            filename = `${title}.${format.container}`;
            contentType = format.mimeType;

        } else {
            // Video download with quality selection
            console.log(`Downloading video - Requested quality: ${quality}`);

            // Try to get format with both video and audio
            const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

            if (formats.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No combined video+audio formats available. Try a different quality.'
                });
            }

            // Filter by quality if specified
            if (quality) {
                const qualityFormats = formats.filter(f =>
                    f.qualityLabel === quality ||
                    f.quality === quality ||
                    (f.qualityLabel && f.qualityLabel.startsWith(quality.replace('p', '')))
                );

                if (qualityFormats.length > 0) {
                    // Get best format of requested quality
                    format = qualityFormats.reduce((best, current) => {
                        const bestBitrate = best.bitrate || 0;
                        const currentBitrate = current.bitrate || 0;
                        return currentBitrate > bestBitrate ? current : best;
                    });
                    console.log(`Found exact quality match: ${format.qualityLabel}`);
                } else {
                    // Fallback to closest quality
                    console.log(`Exact quality ${quality} not found, using best available`);
                    format = formats.reduce((best, current) => {
                        const bestBitrate = best.bitrate || 0;
                        const currentBitrate = current.bitrate || 0;
                        return currentBitrate > bestBitrate ? current : best;
                    });
                }
            } else {
                // No quality specified, get highest quality
                format = formats.reduce((best, current) => {
                    const bestBitrate = best.bitrate || 0;
                    const currentBitrate = current.bitrate || 0;
                    return currentBitrate > bestBitrate ? current : best;
                });
            }

            filename = `${title}_${format.qualityLabel || quality || 'video'}.${format.container}`;
            contentType = format.mimeType || 'video/mp4';

            console.log(`Selected video format - Quality: ${format.qualityLabel}, Container: ${format.container}`);
        }

        if (!format) {
            return res.status(400).json({
                success: false,
                error: 'Requested format not available'
            });
        }

        // Set response headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);

        console.log(`Starting download stream for: ${filename}`);

        // Create download stream
        const downloadStream = ytdl(url, { format: format });

        // Handle stream events
        downloadStream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Download stream failed: ' + error.message
                });
            }
        });

        downloadStream.on('end', () => {
            console.log(`Download completed: ${filename}`);
        });

        // Pipe to response
        downloadStream.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: error.message || 'Download failed'
            });
        }
    }
});

/**
 * Helper function to get available qualities from formats
 */
function getAvailableQualities(formats) {
    const qualities = new Set();

    formats.forEach(format => {
        if (format.hasVideo && format.quality) {
            qualities.add(format.quality);
        }
    });

    // Add audio option
    const hasAudio = formats.some(f => f.hasAudio && !f.hasVideo);
    if (hasAudio) {
        qualities.add('mp3');
    }

    return Array.from(qualities).sort((a, b) => {
        const order = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p', 'mp3'];
        return order.indexOf(a) - order.indexOf(b);
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'YouTube Downloader API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 YouTube Downloader API Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   GET  /api/info?url=<youtube_url>`);
    console.log(`   GET  /api/download?url=<youtube_url>&quality=<quality>`);
    console.log(`   GET  /api/health`);
});

