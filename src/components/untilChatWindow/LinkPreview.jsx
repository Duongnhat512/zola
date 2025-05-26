import React from 'react';

const LinkPreview = ({ preview, sender }) => {
  const handleClick = () => {
    window.open(preview.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
        maxWidth: '350px',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* URL Header */}
      <div style={{
        padding: '8px 12px',
        fontSize: '12px',
        color: '#1890ff',
        borderBottom: '1px solid #f0f0f0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        backgroundColor: '#fafafa',
      }}>
        {preview.url}
      </div>
      
      {/* Thumbnail Image */}
      {preview.image && (
        <div style={{ 
          width: '100%',
          height: '180px',
          overflow: 'hidden',
        }}>
          <img
            src={preview.image}
            alt={preview.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div style={{ padding: '12px' }}>
        {/* Title */}
        <div style={{ 
          fontSize: '14px',
          fontWeight: '600',
          color: '#1a1a1a',
          lineHeight: '1.3',
          marginBottom: '4px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {preview.title}
        </div>
        
        {/* Description */}
        {preview.description && (
          <div style={{ 
            fontSize: '12px',
            color: '#666666',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {preview.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkPreview; 