import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../sass/componentsass/PublicationButton.scss';

const getYouTubeEmbedUrl = (value) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    let videoId = '';

    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.replace(/^\//, '').split('/')[0];
    } else if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v') || '';
      } else if (url.pathname.startsWith('/shorts/')) {
        videoId = url.pathname.split('/')[2] || '';
      } else if (url.pathname.startsWith('/embed/')) {
        videoId = url.pathname.split('/')[2] || '';
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  } catch (error) {
    return null;
  }
};

const PublicationButton = ({ item }) => {
  const [videoOpen, setVideoOpen] = useState(false);
  const videoEmbedUrl = useMemo(() => getYouTubeEmbedUrl(item?.video_link), [item?.video_link]);
  const hasPublication = Boolean(item?.publication_link);
  const hasVideo = Boolean(videoEmbedUrl);

  useEffect(() => {
    if (!videoOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setVideoOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [videoOpen]);

  if (!hasPublication && !hasVideo) return null;

  const videoModal = videoOpen && hasVideo
    ? createPortal(
        <div
          className="feature-video-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${item?.name || 'Location'} video`}
          onClick={() => setVideoOpen(false)}
        >
          <div className="feature-video-modal__content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="feature-video-modal__close"
              onClick={() => setVideoOpen(false)}
              aria-label="Close video"
            >
              ×
            </button>
            <div className="feature-video-modal__frame">
              <iframe
                src={videoEmbedUrl}
                title={`${item?.name || 'Location'} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="feature-actions">
        {hasPublication && (
          <a
            className="feature-button publication-button"
            href={item.publication_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Feature
          </a>
        )}

        {hasVideo && (
          <button
            type="button"
            className="feature-button video-button"
            onClick={() => setVideoOpen(true)}
          >
            View Video
          </button>
        )}
      </div>
      {videoModal}
    </>
  );
};

export default PublicationButton;
