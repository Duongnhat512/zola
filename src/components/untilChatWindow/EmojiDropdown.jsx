import React from "react";

const EmojiDropdown = ({ emojiList, onEmojiClick }) => {
  return (
    <div className="grid grid-cols-8 gap-2 p-2 bg-white shadow-lg rounded-lg max-h-64 overflow-y-auto">
      {Object.entries(emojiList).map(([name, url]) => (
        <img
          key={name}
          src={url}
          alt={name}
          className="w-8 h-8 cursor-pointer"
          onClick={() => onEmojiClick(url)}
        />
      ))}
    </div>
  );
};

export default EmojiDropdown;