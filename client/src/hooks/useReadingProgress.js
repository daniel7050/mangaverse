import { useState, useEffect } from 'react';
import { getProgress } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Returns a map of { mangaId: { lastChapter, lastPage } }
export default function useReadingProgress() {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    if (!user) { setProgressMap({}); return; }
    getProgress()
      .then(res => {
        const map = {};
        (res.data || []).forEach(p => {
          if (p.manga?._id) map[p.manga._id] = { lastChapter: p.lastChapter, lastPage: p.lastPage };
        });
        setProgressMap(map);
      })
      .catch(() => {});
  }, [user]);

  return progressMap;
}
