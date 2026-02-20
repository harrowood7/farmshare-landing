import React from 'react';
import { VideoProps } from '../../types';

export default function VideoSection({ videoUrl, className = '' }: VideoProps) {
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
        loading="lazy"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}