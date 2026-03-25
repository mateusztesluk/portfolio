import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import { getPhotosAlbums } from '../../config';

import './Photos.scss';

export const Photos = () => {
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const albums = useMemo(() => getPhotosAlbums(), []);

  const activeAlbum = useMemo(
    () => albums.find((album) => album.id === activeAlbumId) || null,
    [albums, activeAlbumId]
  );

  const totalPhotos = useMemo(
    () => albums.reduce((sum, album) => sum + album.photos.length, 0),
    [albums]
  );

  const activePhoto = activeAlbum ? activeAlbum.photos[activePhotoIndex] : null;

  const openAlbum = (albumId: string, index = 0) => {
    setActiveAlbumId(albumId);
    setActivePhotoIndex(index);
  };

  const closeAlbum = () => {
    setActiveAlbumId(null);
    setActivePhotoIndex(0);
  };

  const goToNextPhoto = () => {
    if (!activeAlbum) {
      return;
    }

    setActivePhotoIndex((currentIndex) => (currentIndex + 1) % activeAlbum.photos.length);
  };

  const goToPreviousPhoto = () => {
    if (!activeAlbum) {
      return;
    }

    setActivePhotoIndex((currentIndex) => (currentIndex - 1 + activeAlbum.photos.length) % activeAlbum.photos.length);
  };

  useEffect(() => {
    if (!activeAlbum) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAlbum();
      }

      if (event.key === 'ArrowRight') {
        goToNextPhoto();
      }

      if (event.key === 'ArrowLeft') {
        goToPreviousPhoto();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeAlbum]);

  return (
    <div className="photos">
      <nav className="photos__top section-shell" aria-label="Page navigation">
        <Link to="/" className="photos__back-link">
          <ArrowBackIosNewRoundedIcon className="photos__back-icon" fontSize="inherit" />
          Back to home
        </Link>
      </nav>

      <section className="photos__hero section-shell">
        <div className="photos__hero-card surface-card">
          <div className="photos__hero-copy">
            <div className="eyebrow">Private gallery</div>
            <h1 className="photos__title">Collected moments from the road</h1>
            <p className="photos__lead">
              A public window into my private photo albums: quiet landscapes, city fragments and travel memories anyone can browse.
            </p>
          </div>
          <div className="photos__hero-meta">
            <div className="photos__meta-card">
              <span className="photos__meta-label">Albums</span>
              <span className="photos__meta-value">{albums.length}</span>
            </div>
            <div className="photos__meta-card">
              <span className="photos__meta-label">Photos</span>
              <span className="photos__meta-value">{totalPhotos}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="photos__albums section-shell">
        <div className="photos__section-heading">
          <div className="eyebrow">Open albums</div>
          <h2 className="photos__section-title">A personal archive, arranged as travel albums</h2>
          <p className="photos__section-copy">
            Each album opens as a lightbox so visitors can move through the images without leaving the page.
          </p>
        </div>

        <div className="photos__grid">
          {albums.map((album, index) => (
            <article
              className={`photos__album surface-card ${index === 0 ? 'photos__album--featured' : ''}`}
              key={album.id}
            >
              <button
                type="button"
                className="photos__album-button"
                onClick={() => openAlbum(album.id)}
              >
                <div className="photos__album-media">
                  <img
                    className="photos__album-cover"
                    src={album.photos[0].src}
                    alt={album.photos[0].alt}
                  />
                  <div className="photos__album-badge">{album.photos.length} photos</div>
                  <div className="photos__album-stack" aria-hidden="true">
                    {album.photos.slice(1, 3).map((photo) => (
                      <img
                        className="photos__album-stack-image"
                        key={photo.id}
                        src={photo.src}
                        alt=""
                      />
                    ))}
                  </div>
                </div>

                <div className="photos__album-body">
                  <div className="eyebrow">{album.eyebrow}</div>
                  <div className="photos__album-title-row">
                    <h3 className="photos__album-title">{album.title}</h3>
                    <span className="photos__album-year">{album.year}</span>
                  </div>
                  <p className="photos__album-description">{album.description}</p>
                  <div className="photos__album-footer">
                    <span className="photos__album-location">{album.location}</span>
                    <span className="photos__album-cta">Open album</span>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      </section>

      {activeAlbum && activePhoto && (
        <div className="photos__lightbox" onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeAlbum();
          }
        }}>
          <div className="photos__lightbox-shell surface-card">
            <button
              type="button"
              className="photos__lightbox-close"
              onClick={closeAlbum}
              aria-label="Close album"
            >
              <CloseOutlinedIcon fontSize="inherit" />
            </button>

            <div className="photos__lightbox-header">
              <div>
                <div className="eyebrow">{activeAlbum.location}</div>
                <h2 className="photos__lightbox-title">{activeAlbum.title}</h2>
              </div>
              <div className="photos__lightbox-counter">
                {activePhotoIndex + 1} / {activeAlbum.photos.length}
              </div>
            </div>

            <div className="photos__lightbox-stage">
              <button
                type="button"
                className="photos__lightbox-nav photos__lightbox-nav--prev"
                onClick={goToPreviousPhoto}
                aria-label="Previous photo"
              >
                <ArrowBackIosNewRoundedIcon fontSize="inherit" />
              </button>

              <img
                className="photos__lightbox-image"
                src={activePhoto.src}
                alt={activePhoto.alt}
              />

              <button
                type="button"
                className="photos__lightbox-nav photos__lightbox-nav--next"
                onClick={goToNextPhoto}
                aria-label="Next photo"
              >
                <ArrowForwardIosRoundedIcon fontSize="inherit" />
              </button>
            </div>

            <div className="photos__lightbox-caption">{activePhoto.caption}</div>

            <div className="photos__lightbox-strip">
              {activeAlbum.photos.map((photo, index) => (
                <button
                  type="button"
                  key={photo.id}
                  className={`photos__thumb ${index === activePhotoIndex ? 'photos__thumb--active' : ''}`}
                  onClick={() => setActivePhotoIndex(index)}
                  aria-label={`Open photo ${index + 1}`}
                >
                  <img src={photo.src} alt={photo.alt} className="photos__thumb-image" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};