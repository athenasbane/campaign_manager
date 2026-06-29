import React, { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_VIDEO_HEIGHT = 495;

interface IProps {
  videoId: string;
  autoPlay?: boolean;
  title: string;
}

const VideoIframe: React.FC<IProps> = (props) => {
  const { videoId, autoPlay, title } = props;
  const videoURL = `https://www.youtube.com/embed/${videoId}${
    autoPlay ? "?autoplay=1" : ""
  }`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoHeight, setVideoHeight] =
    useState<number>(DEFAULT_VIDEO_HEIGHT);

  const handleChangeVideoWidth = useCallback(() => {
    const ratio =
      window.innerWidth > 990
        ? 1.0
        : window.innerWidth > 522
        ? 1.2
        : window.innerWidth > 400
        ? 1.45
        : 1.85;
    const height = iframeRef.current
      ? iframeRef.current.offsetWidth * 0.5625
      : DEFAULT_VIDEO_HEIGHT;
    return setVideoHeight(Math.floor(height * ratio));
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleChangeVideoWidth);
    handleChangeVideoWidth();
    return function cleanup() {
      window.removeEventListener("resize", handleChangeVideoWidth);
    };
  }, [handleChangeVideoWidth]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      width="100%"
      height={`${videoHeight}px`}
      src={videoURL}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
};

export default VideoIframe;
