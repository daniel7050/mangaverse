const axios = require('axios');
const Manga = require('../models/Manga');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const scrapeMangaList = async (limit = 20, offset = 0) => {
  try {
    const { data } = await axios.get('https://api.mangadex.org/manga', {
      params: {
        limit, offset,
        'order[followedCount]': 'desc',
        availableTranslatedLanguage: ['en'],
        'contentRating[]': ['safe', 'suggestive']
      },
      timeout: 10000
    });
    return data.data || [];
  } catch (err) {
    console.error('Scraper error:', err.message);
    return [];
  }
};

const getCoverImage = async (mangaId, coverId) => {
  try {
    const { data } = await axios.get(`https://api.mangadex.org/cover/${coverId}`, { timeout: 5000 });
    const filename = data.data?.attributes?.fileName;
    return filename ? `https://uploads.mangadex.org/covers/${mangaId}/${filename}.256.jpg` : '';
  } catch { return ''; }
};

const saveMangaToDB = async (mangaData) => {
  const attrs = mangaData.attributes;
  const title = attrs.title?.en || Object.values(attrs.title)[0] || 'Unknown';
  const slug = slugify(title) + '-' + mangaData.id.slice(0, 8);
  const coverRel = mangaData.relationships?.find(r => r.type === 'cover_art');
  const coverImage = coverRel ? await getCoverImage(mangaData.id, coverRel.id) : '';
  const authorRel = mangaData.relationships?.find(r => r.type === 'author');

  const manga = await Manga.findOneAndUpdate(
    { slug },
    {
      title, slug,
      description: attrs.description?.en || '',
      coverImage,
      author: authorRel?.attributes?.name || 'Unknown',
      genres: (attrs.tags || []).map(t => t.attributes?.name?.en).filter(Boolean),
      status: attrs.status || 'ongoing',
      sourceUrl: `https://mangadex.org/title/${mangaData.id}`,
      lastScraped: new Date(),
    },
    { upsert: true, new: true }
  );
  return manga;
};

const runScraper = async () => {
  console.log('🕷️  Starting manga scraper...');
  const results = await scrapeMangaList(25);
  const saved = [];
  for (const item of results) {
    try {
      const manga = await saveMangaToDB(item);
      saved.push(manga);
    } catch (err) {
      console.error(`Failed to save ${item.id}:`, err.message);
    }
  }
  console.log(`✅ Scraped ${saved.length} manga titles`);

  // Auto-trigger chapter scraping after manga scrape
  try {
    const { scrapeAllChapters } = require('./chapterScraper');
    await scrapeAllChapters();
  } catch (err) {
    console.error('Chapter scrape error:', err.message);
  }

  return saved;
};

module.exports = { runScraper, scrapeMangaList, saveMangaToDB };
