import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Reader from '../../components/Reader/Reader';
import { getChapterList, updateProgress } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Read() {
  const { mangaId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [chapterTitle, setChapterTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noPages, setNoPages] = useState(false);
  const chapterNumber = parseFloat(chapterNum) || 1;

  const loadChapter = useCallback(async (num) => {
    setLoading(true); setError(null); setPages([]); setNoPages(false);
    try {
      const [chListRes, chRes] = await Promise.all([
        getChapterList(mangaId),
        axios.get(`${API}/chapters/by-manga/${mangaId}/${num}`)
      ]);
      setChapters(chListRes.data);
      const ch = chRes.data;
      setChapterTitle(ch.title || `Chapter ${num}`);

      if (!ch.pages?.length) {
        setNoPages(true);
      } else {
        setPages(ch.pages);
      }

      if (user) updateProgress(mangaId, num, 1).catch(() => {});
    } catch (err) {
      if (err.response?.status === 404) setError('Chapter not found.');
      else setError('Could not load chapter. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mangaId, user]);

  useEffect(() => { loadChapter(chapterNumber); }, [chapterNumber, loadChapter]);

  const handleChapterChange = (num) => navigate(`/read/${mangaId}/${num}`);

  const currentIndex = chapters.findIndex(c => c.number === chapterNumber);
  const nextChapter = chapters[currentIndex + 1];
  const prevChapter = chapters[currentIndex - 1];

  if (loading) return (
    <div style={{ background:'#000', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem' }}>
      <div className="spinner" />
      <p style={{ color:'#9ca3af', fontSize:'0.9rem' }}>Loading pages from MangaDex…</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)', background:'var(--bg-primary)', minHeight:'100vh' }}>
      <p style={{ fontSize:'1.1rem', marginBottom:'1rem' }}>{error}</p>
      <Link to={`/manga/${mangaId}`} style={{ color:'var(--accent)' }}>← Back to manga</Link>
    </div>
  );

  if (noPages) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)', background:'var(--bg-primary)', minHeight:'100vh' }}>
      <p style={{ fontSize:'1.3rem', marginBottom:'0.5rem' }}>📵 Pages unavailable</p>
      <p style={{ marginBottom:'2rem', color:'var(--text-muted)', maxWidth:'400px', margin:'0 auto 2rem' }}>
        This chapter's pages couldn't be loaded. This manga may be licensed and restricted on MangaDex.
      </p>
      <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
        {prevChapter && (
          <button onClick={() => handleChapterChange(prevChapter.number)}
            style={{ background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-primary)', padding:'0.6rem 1.25rem', borderRadius:'8px', cursor:'pointer' }}>
            ← Chapter {prevChapter.number}
          </button>
        )}
        {nextChapter && (
          <button onClick={() => handleChapterChange(nextChapter.number)}
            style={{ background:'var(--accent)', color:'#fff', padding:'0.6rem 1.25rem', borderRadius:'8px', cursor:'pointer' }}>
            Chapter {nextChapter.number} →
          </button>
        )}
        <Link to={`/manga/${mangaId}`} style={{ color:'var(--accent)', padding:'0.6rem 1.25rem', border:'1px solid var(--accent)', borderRadius:'8px' }}>
          ← Back to manga
        </Link>
      </div>
    </div>
  );

  return (
    <Reader
      pages={pages}
      chapterNumber={chapterNumber}
      chapterTitle={chapterTitle}
      totalChapters={chapters.length}
      onChapterChange={handleChapterChange}
    />
  );
}
