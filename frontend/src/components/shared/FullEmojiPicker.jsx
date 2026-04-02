import React from 'react';
import 'emoji-picker-element';

const FullEmojiPicker = ({ onEmojiSelect, className = '' }) => {
  const pickerRef = React.useRef(null);

  React.useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return undefined;

    const handleEmoji = (event) => {
      const emoji = event?.detail?.unicode;
      if (emoji) onEmojiSelect?.(emoji);
    };

    picker.addEventListener('emoji-click', handleEmoji);
    return () => picker.removeEventListener('emoji-click', handleEmoji);
  }, [onEmojiSelect]);

  return (
    <div className={className}>
      <emoji-picker ref={pickerRef}></emoji-picker>
    </div>
  );
};

export default FullEmojiPicker;
