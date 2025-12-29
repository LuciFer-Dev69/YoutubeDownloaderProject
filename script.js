/**
 * Video Hub - Frontend
 * 
 * Architecture:
 * - Frontend: HTML/CSS/JS
 * - Backend: Node.js + Express + ytdl-core
 * - API Endpoints:
 *   - GET /api/info - Get video information
 *   - GET /api/download - Download video/audio
 * 
 * Fallback: Opens external download services if API fails
 */

// API Configuration
const API_BASE_URL = window.location.origin; // Use same origin (backend serves frontend)
// For development with separate frontend/backend:
// const API_BASE_URL = 'http://localhost:3000';

// YouTube URL validation regex
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

// Video quality options
const QUALITY_OPTIONS = {
    '2160p': '4K (2160p)',
    '1440p': '1440p',
    '1080p': '1080p',
    '720p': '720p',
    '480p': '480p',
    '360p': '360p',
    '240p': '240p',
    '144p': '144p',
    'mp3': 'MP3 Audio'
};

// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const fetchBtn = document.getElementById('fetchBtn');
const errorMessage = document.getElementById('errorMessage');
const videoPreview = document.getElementById('videoPreview');
const videoThumbnail = document.getElementById('videoThumbnail');
const videoTitle = document.getElementById('videoTitle');
const videoDuration = document.getElementById('videoDuration');
const videoChannel = document.getElementById('videoChannel');
const downloadSection = document.getElementById('downloadSection');
const qualitySelect = document.getElementById('qualitySelect');
const downloadBtn = document.getElementById('downloadBtn');
const infoMessage = document.getElementById('infoMessage');

// Extract video ID from YouTube URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/.*[?&]v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// Validate YouTube URL
function validateYouTubeUrl(url) {
    if (!url || url.trim() === '') {
        return { valid: false, message: 'Please enter a YouTube URL' };
    }
    
    if (!YOUTUBE_URL_REGEX.test(url)) {
        return { valid: false, message: 'Please enter a valid YouTube URL' };
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        return { valid: false, message: 'Could not extract video ID from URL' };
    }
    
    return { valid: true, videoId };
}

// Get video thumbnail URL
function getThumbnailUrl(videoId, quality = 'maxresdefault') {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

// Fetch video metadata using our own API
async function fetchVideoMetadata(videoId, videoUrl) {
    try {
        const apiUrl = `${API_BASE_URL}/api/info?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch video metadata');
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch video metadata');
        }
        
        const data = result.data;
        
        // Format duration
        const durationSeconds = parseInt(data.duration);
        const duration = durationSeconds ? formatDuration(durationSeconds) : 'N/A';
        
        return {
            title: data.title,
            duration: duration,
            channel: data.channel,
            videoId: data.videoId,
            thumbnail: data.thumbnail,
            formats: data.formats,
            availableQualities: data.availableQualities
        };
    } catch (error) {
        console.error('Error fetching metadata:', error);
        showError(error.message || 'Failed to fetch video information');
        
        // Fallback to basic info
        return {
            title: `YouTube Video - ${videoId.substring(0, 8)}`,
            duration: 'N/A',
            channel: 'Unknown',
            videoId: videoId,
            thumbnail: getThumbnailUrl(videoId),
            formats: [],
            availableQualities: []
        };
    }
}

// Format duration from seconds to MM:SS or HH:MM:SS
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Display error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.remove('show');
}

// Show loading state
function setLoading(isLoading) {
    if (isLoading) {
        fetchBtn.disabled = true;
        fetchBtn.querySelector('.btn-text').style.display = 'none';
        fetchBtn.querySelector('.btn-loader').style.display = 'flex';
    } else {
        fetchBtn.disabled = false;
        fetchBtn.querySelector('.btn-text').style.display = 'inline';
        fetchBtn.querySelector('.btn-loader').style.display = 'none';
    }
}

// Store current video data
let currentVideoData = null;

// Display video preview
function displayVideoPreview(metadata, videoId) {
    videoTitle.textContent = metadata.title;
    videoDuration.textContent = metadata.duration !== 'N/A' ? `Duration: ${metadata.duration}` : '';
    videoChannel.textContent = `Channel: ${metadata.channel}`;
    videoThumbnail.src = metadata.thumbnail || getThumbnailUrl(videoId);
    videoThumbnail.alt = metadata.title;
    
    // Store video data for download
    currentVideoData = {
        videoId: videoId,
        url: videoUrlInput.value.trim(),
        title: metadata.title,
        formats: metadata.formats,
        availableQualities: metadata.availableQualities
    };
    
    // Update quality options based on available formats
    updateQualityOptions(metadata.availableQualities);
    
    videoPreview.style.display = 'block';
    downloadSection.style.display = 'block';
    
    // Reset quality selection and ensure UI state
    qualitySelect.value = '';
    qualitySelect.disabled = false;
    downloadBtn.disabled = true;
    hideInfoMessage();
    
    console.log('Video preview displayed. Available qualities:', metadata.availableQualities);
}

// Update quality dropdown based on available formats
function updateQualityOptions(availableQualities) {
    // Clear all options except the first "Choose quality..." option
    // Remove all optgroups first
    const optgroups = qualitySelect.querySelectorAll('optgroup');
    optgroups.forEach(optgroup => optgroup.remove());
    
    // Remove all options except the first one
    while (qualitySelect.options.length > 1) {
        qualitySelect.remove(1);
    }
    
    // If no qualities available, keep default options from HTML
    if (!availableQualities || availableQualities.length === 0) {
        console.warn('No available qualities from API, using default options');
        // Restore default options from HTML
        const defaultVideoGroup = document.createElement('optgroup');
        defaultVideoGroup.label = 'Video Quality';
        
        const defaultQualities = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'];
        defaultQualities.forEach(quality => {
            const option = document.createElement('option');
            option.value = quality;
            option.textContent = QUALITY_OPTIONS[quality] || quality;
            defaultVideoGroup.appendChild(option);
        });
        
        const defaultAudioGroup = document.createElement('optgroup');
        defaultAudioGroup.label = 'Audio Only';
        const audioOption = document.createElement('option');
        audioOption.value = 'mp3';
        audioOption.textContent = 'MP3 Audio (Best Quality)';
        defaultAudioGroup.appendChild(audioOption);
        
        qualitySelect.appendChild(defaultVideoGroup);
        qualitySelect.appendChild(defaultAudioGroup);
        return;
    }
    
    // Add available qualities
    const videoQualities = availableQualities.filter(q => q !== 'mp3' && q !== 'audio');
    const hasAudio = availableQualities.includes('mp3') || availableQualities.includes('audio');
    
    if (videoQualities.length > 0) {
        const videoGroup = document.createElement('optgroup');
        videoGroup.label = 'Video Quality';
        
        // Sort qualities in descending order
        const sortedQualities = videoQualities.sort((a, b) => {
            const order = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'];
            return order.indexOf(a) - order.indexOf(b);
        });
        
        sortedQualities.forEach(quality => {
            const option = document.createElement('option');
            option.value = quality;
            option.textContent = QUALITY_OPTIONS[quality] || quality;
            videoGroup.appendChild(option);
        });
        
        qualitySelect.appendChild(videoGroup);
    }
    
    if (hasAudio) {
        const audioGroup = document.createElement('optgroup');
        audioGroup.label = 'Audio Only';
        
        const option = document.createElement('option');
        option.value = 'mp3';
        option.textContent = 'MP3 Audio (Best Quality)';
        audioGroup.appendChild(option);
        
        qualitySelect.appendChild(audioGroup);
    }
    
    // Ensure the select is enabled and reset
    qualitySelect.disabled = false;
    qualitySelect.value = '';
    downloadBtn.disabled = true;
}

// Handle fetch button click
async function handleFetch() {
    const url = videoUrlInput.value.trim();
    hideError();
    
    const validation = validateYouTubeUrl(url);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    setLoading(true);
    
    try {
        const metadata = await fetchVideoMetadata(validation.videoId, url);
        displayVideoPreview(metadata, validation.videoId);
    } catch (error) {
        showError('Failed to fetch video information. Please try again.');
        console.error('Error fetching video metadata:', error);
    } finally {
        setLoading(false);
    }
}

// Handle quality selection change
function handleQualityChange() {
    const selectedQuality = qualitySelect.value;
    console.log('Quality selected:', selectedQuality);
    console.log('Quality select element:', qualitySelect);
    console.log('Available options:', Array.from(qualitySelect.options).map(opt => ({ value: opt.value, text: opt.text })));
    
    if (selectedQuality && selectedQuality !== '' && selectedQuality !== 'Choose quality...') {
        downloadBtn.disabled = false;
        hideInfoMessage();
        const qualityLabel = QUALITY_OPTIONS[selectedQuality] || selectedQuality;
        showInfoMessage(`Ready to download: ${qualityLabel}`, 'success');
        
        // Visual feedback - highlight the select
        qualitySelect.style.borderColor = 'var(--success-color)';
        setTimeout(() => {
            if (qualitySelect.value === selectedQuality) {
                qualitySelect.style.borderColor = '';
            }
        }, 2000);
    } else {
        downloadBtn.disabled = true;
        hideInfoMessage();
        qualitySelect.style.borderColor = '';
    }
}

// Get download URL from our own API
async function getDownloadUrl(videoUrl, quality) {
    try {
        const apiUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;
        return apiUrl; // Our API streams directly, so return the API endpoint
    } catch (error) {
        console.error('Error getting download URL:', error);
        return null;
    }
}

// Actual download function - uses our own API
async function downloadVideo(videoId, quality, videoUrl, title) {
    try {
        showInfoMessage(`Preparing download: ${QUALITY_OPTIONS[quality] || quality}...`, '');
        downloadBtn.disabled = true;
        
        const qualityLabel = QUALITY_OPTIONS[quality] || quality;
        const format = quality === 'mp3' ? 'mp3' : 'mp4';
        
        // Get download URL from our API
        const downloadUrl = await getDownloadUrl(videoUrl, quality);
        
        if (downloadUrl) {
            showInfoMessage(`Starting download: ${qualityLabel}...`, 'success');
            
            // Create download link and trigger it
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${title.replace(/[^a-z0-9]/gi, '_')}_${quality}.${format}`;
            link.target = '_blank';
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Clean up after a delay
            setTimeout(() => {
                if (link.parentNode) {
                    document.body.removeChild(link);
                }
            }, 1000);
            
            showInfoMessage(`Download started: ${qualityLabel}. Check your downloads folder.`, 'success');
        } else {
            // Fallback: Use external services
            showInfoMessage(`API unavailable. Using fallback service...`, '');
            await fallbackDownload(videoId, videoUrl, qualityLabel);
        }
        
        // Re-enable button after a delay
        setTimeout(() => {
            downloadBtn.disabled = false;
        }, 3000);
        
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to start download. Trying fallback...');
        await fallbackDownload(videoId, videoUrl, QUALITY_OPTIONS[quality] || quality);
        downloadBtn.disabled = false;
    }
}

// Fallback download method using external services
async function fallbackDownload(videoId, videoUrl, qualityLabel) {
    // Use Y2Mate as primary fallback
    const y2mateUrl = `https://www.y2mate.com/youtube/${videoId}`;
    const y2mateWindow = window.open(y2mateUrl, '_blank', 'noopener,noreferrer');
    
    if (y2mateWindow) {
        showInfoMessage(`Fallback: Download page opened. Select ${qualityLabel} quality.`, 'success');
    } else {
        showInfoMessage(`Popup blocked. Please allow popups or use alternative links below.`, '');
    }
    
    // Create alternative download links
    createAlternativeLinks(videoUrl, qualityLabel);
}

// Create alternative download link buttons
function createAlternativeLinks(videoUrl, qualityLabel) {
    // Remove existing alternative links if any
    const existing = document.getElementById('alternativeLinks');
    if (existing) {
        existing.remove();
    }
    
    const altLinksDiv = document.createElement('div');
    altLinksDiv.id = 'alternativeLinks';
    altLinksDiv.style.marginTop = '1rem';
    altLinksDiv.style.padding = '1rem';
    altLinksDiv.style.background = 'var(--surface-light)';
    altLinksDiv.style.borderRadius = '8px';
    altLinksDiv.style.border = '1px solid var(--border-color)';
    
    const title = document.createElement('p');
    title.textContent = 'Alternative Download Services:';
    title.style.marginBottom = '0.75rem';
    title.style.fontWeight = '600';
    title.style.color = 'var(--text-primary)';
    altLinksDiv.appendChild(title);
    
    const linksContainer = document.createElement('div');
    linksContainer.style.display = 'flex';
    linksContainer.style.gap = '0.5rem';
    linksContainer.style.flexWrap = 'wrap';
    linksContainer.style.justifyContent = 'center';
    
    const videoId = extractVideoId(videoUrl);
    const services = [
        { name: 'Y2Mate (Recommended)', url: `https://www.y2mate.com/youtube/${videoId}` },
        { name: 'SaveFrom.net', url: `https://savefrom.net/#url=${encodeURIComponent(videoUrl)}` },
        { name: 'Loader.to', url: `https://loader.to/?url=${encodeURIComponent(videoUrl)}` },
        { name: 'YT1s.com', url: `https://yt1s.com/en?q=${encodeURIComponent(videoUrl)}` }
    ];
    
    services.forEach(service => {
        const link = document.createElement('a');
        link.href = service.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'alternative-link';
        link.textContent = service.name;
        link.style.padding = '0.75rem 1.25rem';
        link.style.background = 'var(--surface)';
        link.style.color = 'var(--text-primary)';
        link.style.borderRadius = '6px';
        link.style.textDecoration = 'none';
        link.style.fontSize = '0.9rem';
        link.style.transition = 'all 0.3s ease';
        link.style.border = '1px solid var(--border-color)';
        link.style.display = 'inline-block';
        link.addEventListener('mouseenter', () => {
            link.style.background = 'var(--primary-color)';
            link.style.borderColor = 'var(--primary-color)';
            link.style.transform = 'translateY(-2px)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.background = 'var(--surface)';
            link.style.borderColor = 'var(--border-color)';
            link.style.transform = 'translateY(0)';
        });
        linksContainer.appendChild(link);
    });
    
    altLinksDiv.appendChild(linksContainer);
    downloadSection.appendChild(altLinksDiv);
}

// Show info message
function showInfoMessage(message, type = '') {
    infoMessage.textContent = message;
    infoMessage.className = `info-message show ${type}`;
}

// Hide info message
function hideInfoMessage() {
    infoMessage.classList.remove('show');
    infoMessage.className = 'info-message';
}

// Handle download button click
async function handleDownload() {
    const selectedQuality = qualitySelect.value;
    
    console.log('Download clicked. Selected quality:', selectedQuality);
    console.log('Current video data:', currentVideoData);
    
    if (!selectedQuality || selectedQuality === '') {
        showError('Please select a quality option from the dropdown');
        qualitySelect.focus();
        return;
    }
    
    if (!currentVideoData) {
        showError('Please fetch video information first');
        return;
    }
    
    await downloadVideo(
        currentVideoData.videoId,
        selectedQuality,
        currentVideoData.url,
        currentVideoData.title
    );
}

// Event Listeners
fetchBtn.addEventListener('click', handleFetch);

videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleFetch();
    }
});

qualitySelect.addEventListener('change', handleQualityChange);

downloadBtn.addEventListener('click', handleDownload);

// Allow paste events
videoUrlInput.addEventListener('paste', () => {
    setTimeout(() => {
        // Auto-validate on paste
        const url = videoUrlInput.value.trim();
        if (url && YOUTUBE_URL_REGEX.test(url)) {
            hideError();
        }
    }, 100);
});

// Initialize
console.log('Video Hub - Frontend');
console.log('Using own backend API for downloads.');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log('Architecture: HTML/CSS/JS → Node.js/Express API → ytdl-core → Direct Downloads');

