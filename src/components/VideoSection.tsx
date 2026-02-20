import React from 'react';

interface VideoSectionProps {
  videoUrl: string;
  className?: string;
}

export default function VideoSection({ videoUrl, className = '' }: VideoSectionProps) {
  return (
    <div className={`rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden ${className}`}>
      <video 
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="metadata"
        poster=""
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}