import React, { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiMenu } from 'react-icons/fi';
import './Reader.css';

export default function Reader({ pages = [], chapterNumber, onChapterChange, totalChapters }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) setCurrentPage(p => p + 1);
    else if (chapterNumber < totalChapters) onChapterChange?.(chapterNumber + 1);
  }, [currentPage, pages.length, chapterNumber, totalChapters, onChapterChange]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
    else if (chapterNumber > 1) onChapterChange?.(chapterNumber - 1);
  }, [currentPage, chapterNumber, onChapterChange]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (!pages.length) return <div className="reader-empty">No pages to display</div>;

  return (
    <div className="reader" onClick={() => setShowControls(s => !s)}>
      <div className={`reader-controls reader-controls-top ${showControls ? 'visible' : ''}`}>
        <span>Chapter {chapterNumber}</span>
        <span>{currentPage + 1} / {pages.length}</span>
      </div>

      <div className="reader-page">
        <img
          src={pages[currentPage]?.imageUrl} alt={`Page ${currentPage + 1}`}
          loading="eager"
        />
      </div>

      <div className={`reader-controls reader-controls-bottom ${showControls ? 'visible' : ''}`}>
        <button className="reader-btn" onClick={(e) => { e.stopPropagation(); goPrev(); }}>
          <FiChevronLeft /> Prev
        </button>
        <div className="reader-progress">
          {pages.map((_, i) => (
            <button
              key={i}
              className={`reader-dot ${i === currentPage ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setCurrentPage(i); }}
            />
          ))}
        </div>
        <button className="reader-btn" onClick={(e) => { e.stopPropagation(); goNext(); }}>
          Next <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
