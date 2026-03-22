import React, { useEffect, useMemo, useState } from 'react';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import './Photos.scss';

interface PhotoItem {
  id: string;
  alt: string;
  caption: string;
  src: string;
}

interface Album {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  location: string;
  year: string;
  photos: PhotoItem[];
}

const fileServerBase = 'http://localhost:8082';

const createPhoto = (
  id: string,
  filename: string,
  alt: string,
  caption: string
): PhotoItem => ({
  id,
  alt,
  caption,
  src: `${fileServerBase}/${filename}`
});

const albums: Album[] = [
  {
    id: 'andalusia-light',
    eyebrow: 'Road album',
    title: 'Andalusia light',
    description: 'Golden evenings, dry hills and the quiet rhythm of southern streets collected as a calm summer diary.',
    location: 'Spain',
    year: '2026',
    photos: [
      createPhoto('andalusia-1', '/files/album1/1.jpg', 'Sunset over Andalusia hills', 'A late golden hour somewhere between white villages and dusty roads.'),
      createPhoto('andalusia-2', '/files/BLOG_12_0.jpg', 'Warm valley in Spain', 'The kind of view that makes you stop the car for a minute longer than planned.'),
      createPhoto('andalusia-3', '/files/BLOG_12_0.jpg', 'Editorial travel frame from Spain', 'A private note from a very bright afternoon and a very empty horizon.')
    ]
  },
  {
    id: 'northern-coast',
    eyebrow: 'Sea notes',
    title: 'Northern coast',
    description: 'Wind, colder tones and long open space. A quieter album built around shoreline textures and weather.',
    location: 'Baltic coast',
    year: '2025',
    photos: [
      createPhoto('coast-1', '/files/BLOG_12_0.jpg', 'Coastal morning with pale sky', 'A washed-out horizon and the kind of silence only morning water gives.'),
      createPhoto('coast-2', '/files/BLOG_12_0.jpg', 'Sea path and dunes', 'Collected from a walk with cold hands, a full camera roll and almost no people around.'),
      createPhoto('coast-3', '/files/BLOG_12_0.jpg', 'Minimal sea landscape', 'Muted colors, simple geometry and the kind of frame that feels almost empty in the best way.')
    ]
  },
  {
    id: 'city-postcards',
    eyebrow: 'Private city',
    title: 'City postcards',
    description: 'A softer urban album with evening windows, terraces and fragments of travel that feel half documentary, half memory.',
    location: 'European cities',
    year: '2024',
    photos: [
      createPhoto('city-1', '/files/BLOG_12_0.jpg', 'Evening city postcard', 'More about atmosphere than landmarks: terraces, facades and small pieces of a route.'),
      createPhoto('city-2', '/files/BLOG_12_0.jpg', 'Quiet street at dusk', 'A frame kept mostly for the light bouncing from the walls just before blue hour.'),
      createPhoto('city-3', '/files/BLOG_12_0.jpg', 'Urban travel composition', 'One of those private city frames that are impossible to explain and easy to remember.'),
      createPhoto('city-4', '/files/BLOG_12_0.jpg', 'Night starting over the city', 'The transition between the last warm facade and the first darker shadow.')
    ]
  }
];

export const Photos = () => {
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const activeAlbum = useMemo(
    () => albums.find((album) => album.id === activeAlbumId) || null,
    [activeAlbumId]
  );

  const totalPhotos = useMemo(
    () => albums.reduce((sum, album) => sum + album.photos.length, 0),
    []
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