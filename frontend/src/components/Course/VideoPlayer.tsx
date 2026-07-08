import React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="relative pb-[56.25%]">
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls
          playing={false}
          className="absolute top-0 left-0"
        />
      </div>
      <div className="p-4 bg-gray-800 text-white">
        <h3 className="font-semibold">{title}</h3>
      </div>
    </div>
  );
};
