import React from 'react';

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const wholeSeconds = Math.round(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = `${wholeSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${remainder}`;
};

const AudioAttachment = ({ src, className = '', controlsClassName = '', metaClassName = '' }) => {
  const [duration, setDuration] = React.useState(0);

  return (
    <div className={className}>
      <audio
        controls
        src={src}
        className={controlsClassName}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
      />
      <div className={metaClassName}>{formatDuration(duration)}</div>
    </div>
  );
};

export default AudioAttachment;
