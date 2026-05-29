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
  const chapterNumber = parseFloat(chapterNum) || 1;

  const loadChapter = useCallback(async (num) => {
    setLoading(true); setError(null); setPages([]);
    try {
      const [chListRes, chRes] = await Promise.all([
        getChapterList(mangaId),
        axios.get(`${API}/chapters/by-manga/${mangaId}/${num}`)
      ]);
      setChapters(chListRes.data);
      const ch = chRes.data;
      setChapterTitle(ch.title || `Chapter ${num}`);
      setPages(ch.pages || []);

      if (user) updateProgress(mangaId, num, 1).catch(() => {});
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Chapter not found. It may not have been scraped yet.');
      } else {
        setError('Could not load chapter pages. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [mangaId, user]);

  useEffect(() => { loadChapter(chapterNumber); }, [chapterNumber, loadChapter]);

  const handleChapterChange = (num) => navigate(`/read/${mangaId}/${num}`);

  if (loading) return (
    <div style={{ background:'#000', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem' }}>
      <div className="spinner" />
      <p style={{ color:'#9ca3af', fontSize:'0.9rem' }}>Loading chapter pages…</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)', background:'var(--bg-primary)', minHeight:'100vh' }}>
      <p style={{ fontSize:'1.1rem', marginBottom:'1rem' }}>{error}</p>
      <Link to={`/manga/${mangaId}`} style={{ color:'var(--accent)' }}>← Back to manga</Link>
    </div>
  );

  if (!pages.length) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)', background:'var(--bg-primary)', minHeight:'100vh' }}>
      <p>No pages available for this chapter.</p>
      <Link to={`/manga/${mangaId}`} style={{ color:'var(--accent)', marginTop:'1rem', display:'block' }}>← Back to manga</Link>
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
