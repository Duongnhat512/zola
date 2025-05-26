// Utility functions for link preview - Frontend only

// Regex để detect URL
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Detect URLs trong text
export const detectUrls = (text) => {
  if (!text) return [];
  const urls = text.match(URL_REGEX);
  return urls || [];
};

// Kiểm tra xem có phải là YouTube URL không
export const isYouTubeUrl = (url) => {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  return youtubeRegex.test(url);
};

// Extract YouTube video ID
export const getYouTubeVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

// Kiểm tra các loại URL khác
export const isTikTokUrl = (url) => {
  return /tiktok\.com\//.test(url);
};

export const isTwitterUrl = (url) => {
  return /(twitter\.com|x\.com)\//.test(url);
};

export const isInstagramUrl = (url) => {
  return /instagram\.com\//.test(url);
};

export const isFacebookUrl = (url) => {
  return /facebook\.com\//.test(url);
};

// Tạo YouTube metadata sử dụng oEmbed API
export const createYouTubeMetadata = async (url) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  try {
    // Sử dụng YouTube oEmbed API (không cần API key)
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch YouTube data');
    }
    
    const data = await response.json();
    
    return {
      url,
      title: data.title || 'Video YouTube',
      description: `Bởi ${data.author_name || 'YouTube'} • ${data.provider_name}`,
      image: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      siteName: 'YouTube',
      favicon: 'https://www.youtube.com/favicon.ico',
      type: 'video',
      videoId,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    // Fallback với thông tin cơ bản
    return {
      url,
      title: 'Video YouTube',
      description: 'Xem trên YouTube',
      image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      siteName: 'YouTube',
      favicon: 'https://www.youtube.com/favicon.ico',
      type: 'video',
      videoId,
    };
  }
};

// Tạo TikTok metadata (sử dụng oEmbed)
export const createTikTokMetadata = async (url) => {
  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch TikTok data');
    }
    
    const data = await response.json();
    
    return {
      url,
      title: data.title || 'Video TikTok',
      description: `Bởi ${data.author_name || 'TikTok'} • ${data.provider_name}`,
      image: data.thumbnail_url,
      siteName: 'TikTok',
      favicon: 'https://www.tiktok.com/favicon.ico',
      type: 'video',
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Error fetching TikTok metadata:', error);
    return createBasicMetadata(url, 'TikTok', 'https://www.tiktok.com/favicon.ico');
  }
};

// Tạo metadata cơ bản cho các URL khác
export const createBasicMetadata = (url, siteName = null, favicon = null) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    return {
      url,
      title: `Link từ ${siteName || hostname}`,
      description: `Nhấp để xem nội dung từ ${siteName || hostname}`,
      image: null,
      siteName: siteName || hostname,
      favicon: favicon || `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      type: 'website',
    };
  } catch (error) {
    return {
      url,
      title: 'Liên kết',
      description: 'Nhấp để xem nội dung',
      image: null,
      siteName: 'Website',
      favicon: null,
      type: 'website',
    };
  }
};

// Hàm chính để xử lý link preview
export const processMessageLinks = async (message) => {
  const urls = detectUrls(message);
  if (urls.length === 0) return [];

  const previews = await Promise.all(
    urls.map(async (url) => {
      try {
        if (isYouTubeUrl(url)) {
          return await createYouTubeMetadata(url);
        } else if (isTikTokUrl(url)) {
          return await createTikTokMetadata(url);
        } else if (isTwitterUrl(url)) {
          return createBasicMetadata(url, 'Twitter', 'https://abs.twimg.com/favicons/twitter.3.ico');
        } else if (isInstagramUrl(url)) {
          return createBasicMetadata(url, 'Instagram', 'https://static.cdninstagram.com/rsrc.php/v3/yt/r/30PrGfR3xhD.ico');
        } else if (isFacebookUrl(url)) {
          return createBasicMetadata(url, 'Facebook', 'https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico');
        } else {
          return createBasicMetadata(url);
        }
      } catch (error) {
        console.error('Error processing URL:', url, error);
        return createBasicMetadata(url);
      }
    })
  );

  return previews.filter(preview => preview !== null);
};

// Cache để tránh fetch lại
const linkCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export const getCachedLinkPreview = async (url) => {
  const cacheKey = url;
  const cached = linkCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Xóa cache cũ
  if (cached) {
    linkCache.delete(cacheKey);
  }
  
  // Fetch mới và cache
  const preview = await processMessageLinks(url);
  linkCache.set(cacheKey, {
    data: preview,
    timestamp: Date.now(),
  });
  
  return preview;
}; 