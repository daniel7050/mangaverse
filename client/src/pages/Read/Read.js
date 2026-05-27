import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Reader from '../../components/Reader/Reader';
import { getChapterList, getMangaDexPages, updateProgress } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Read() {
  const { mangaId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chapterNumber = parseInt(chapterNum) || 1;

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const chList = await getChapterList(mangaId);
        setChapters(chList.data);
        const chapter = chList.data.find(c => c.number === chapterNumber);
        if (!chapter) { setError('Chapter not found'); return; }

        // Try to get pages from DB first, then MangaDex
        if (chapter.pages?.length) {
          setPages(chapter.pages);
        } else {
          // Extract MangaDex chapter ID from sourceUrl
          const mdId = chapter.sourceUrl?.split('/').pop();
          if (mdId) {
            const pagesRes = await getMangaDexPages(mdId);
            setPages(pagesRes.data.pages || []);
          }
        }

        // Save progress if logged in
        if (user) {
          updateProgress(mangaId, chapterNumber, 1).catch(() => {});
        }
      } catch (err) {
        setError('Could not load chapter pages.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mangaId, chapterNumber, user]);

  const handleChapterChange = (num) => navigate(`/read/${mangaId}/${num}`);

  if (loading) return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
      <p>{error}</p>
      <Link to={`/manga/${mangaId}`} style={{ color: 'var(--accent)', marginTop: '1rem', display: 'block' }}>
        ← Back to manga
      </Link>
    </div>
  );

  return (
    <Reader
      pages={pages}
      chapterNumber={chapterNumber}
      totalChapters={chapters.length}
      onChapterChange={handleChapterChange}
    />
  );
}
