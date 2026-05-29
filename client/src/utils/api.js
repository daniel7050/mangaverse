import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manga
export const getManga = (params) => api.get('/manga', { params });
export const getTrending = () => api.get('/manga/trending');
export const getMangaById = (id) => api.get(`/manga/${id}`);
export const getChapterList = (mangaId) => api.get(`/manga/${mangaId}/chapters`);
export const searchManga = (q, genre) => api.get('/manga/search', { params: { q, genre } });

// Chapters
export const getChapter = (id) => api.get(`/chapters/${id}`);
export const getMangaDexPages = (chapterId) => api.get(`/chapters/mangadex/${chapterId}`);

// Auth (Hamzat's endpoints)
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// User
export const getBookmarks = () => api.get('/user/bookmarks');
export const addBookmark = (mangaId) => api.post('/user/bookmarks', { mangaId });
export const removeBookmark = (mangaId) => api.delete(`/user/bookmarks/${mangaId}`);
export const getProgress = () => api.get('/user/progress');
export const updateProgress = (mangaId, lastChapter, lastPage) =>
  api.post('/user/progress', { mangaId, lastChapter, lastPage });

export default api;

// Genres
export const getGenres = () => api.get('/manga/genres');
export const updateAvatar = (avatar) => api.put('/user/avatar', { avatar });
export const scrapeChapters = (mangaId) => api.post(`/manga/${mangaId}/scrape-chapters`);
