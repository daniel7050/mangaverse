const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const proxyCover = (url) => {
  if (!url) return '';
  if (process.env.NODE_ENV === 'production' && url.includes('mangadex')) {
    return `${API}/proxy/image?url=${encodeURIComponent(url)}`;
  }
  return url;
};
