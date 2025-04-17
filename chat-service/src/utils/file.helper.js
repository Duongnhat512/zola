/**
 * File type helper
 * Cung cấp các hàm hỗ trợ liên quan đến loại tệp
 */

// Phân loại tệp dựa trên loại mime
const FILE_TYPES = {
    // Image 
    IMAGE: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif"
    ],
    
    // Video 
    VIDEO: [
      "video/mp3", // Lưu ý: mp3 thường là audio, không phải video
      "video/mp4",
      "video/mpeg",
      "video/ogg",
      "video/webm",
      "video/mkv"
    ],
    
    // Document 
    DOCUMENT: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    
    // Presentation 
    PRESENTATION: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ],
    
    // Archive 
    ARCHIVE: [
      "application/vnd.rar",
      "application/zip"
    ]
  };
  
  // Tất cả các loại tệp được hỗ trợ
  const SUPPORTED_FILE_TYPES = [
    ...FILE_TYPES.IMAGE,
    ...FILE_TYPES.VIDEO,
    ...FILE_TYPES.DOCUMENT,
    ...FILE_TYPES.PRESENTATION,
    ...FILE_TYPES.ARCHIVE
  ];
  
  /**
   * Phân loại tệp dựa trên loại mime
   * @param {string} mimeType - mimeType của tệp
   * @returns {string} - Tệp (image, video, document, presentation, archive, unknown)
   */
  function getFileCategory(mimeType) {
    if (FILE_TYPES.IMAGE.includes(mimeType)) return 'image';
    if (FILE_TYPES.VIDEO.includes(mimeType)) return 'video';
    if (FILE_TYPES.DOCUMENT.includes(mimeType)) return 'document';
    if (FILE_TYPES.PRESENTATION.includes(mimeType)) return 'presentation';
    if (FILE_TYPES.ARCHIVE.includes(mimeType)) return 'archive';
    return 'unknown';
  }
  
  /**
   * Kiểm tra file có hỗ trợ không
   * @param {string} mimeType - mimeType của tệp
   * @returns {boolean} - true nếu tệp được hỗ trợ, false nếu không
   */
  function isFileTypeSupported(mimeType) {
    return SUPPORTED_FILE_TYPES.includes(mimeType);
  }
  
  /**
   * Lấy tên loại tệp dễ đọc từ mime type
   * @param {string} mimeType - mimeType của tệp
   * @returns {string} - Tên loại tệp dễ đọc
   */
  function getReadableFileTypeName(mimeType) {
    const category = getFileCategory(mimeType);
    
    const typeMap = {
      'image': 'Hình ảnh',
      'video': 'Video',
      'document': 'Tài liệu',
      'presentation': 'Bài thuyết trình',
      'archive': 'Tệp nén',
      'unknown': 'Tệp không xác định'
    };
    
    return typeMap[category] || 'Tệp không xác định';
  }
  
  /**
   * Lấy đuôi mở rộng tệp từ mime type
   * @param {string} mimeType - mimeType của tệp
   * @returns {string} - đuôi mở rộng tệp
   */
  function getFileExtensionFromMimeType(mimeType) {
    const extensionMap = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'video/mp3': 'mp3',
      'video/mp4': 'mp4',
      'video/mpeg': 'mpeg',
      'video/ogg': 'ogg',
      'video/webm': 'webm',
      'video/mkv': 'mkv',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.rar': 'rar',
      'application/zip': 'zip'
    };
    
    return extensionMap[mimeType] || '';
  }
  
  /**
   * Lấy mime type từ tên tệp
   * @param {string} fileName - Tên tệp
   * @returns {string|null} - mime type hoặc null nếu không tìm thấy
   */
  function getMimeTypeFromFileName(fileName) {
    if (!fileName) return null;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    const mimeMap = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'mp3': 'video/mp3',
      'mp4': 'video/mp4',
      'mpeg': 'video/mpeg',
      'ogg': 'video/ogg',
      'webm': 'video/webm',
      'mkv': 'video/mkv',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'rar': 'application/vnd.rar',
      'zip': 'application/zip'
    };
    
    return mimeMap[extension] || null;
  }
  
  module.exports = {
    FILE_TYPES,
    SUPPORTED_FILE_TYPES,
    getFileCategory,
    isFileTypeSupported,
    getReadableFileTypeName,
    getFileExtensionFromMimeType,
    getMimeTypeFromFileName
  };