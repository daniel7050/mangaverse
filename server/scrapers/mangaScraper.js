const axios = require('axios');
const Manga = require('../models/Manga');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

  return await Manga.findOneAndUpdate(
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
};

// Check if a manga has EN chapters on MangaDex
const hasEnglishChapters = async (mangaId) => {
  try {
    const { data } = await axios.get('https://api.mangadex.org/chapter', {
      params: {
        manga: mangaId,
        limit: 1,
        'translatedLanguage[]': ['en'],
        'contentRating[]': ['safe', 'suggestive'],
        'includeExternalUrl': 0
      },
      timeout: 8000,
      headers: { 'User-Agent': 'MangaVerse/1.0' }
    });
    return (data.total || 0) > 0;
  } catch { return false; }
};

const runScraper = async () => {
  console.log('🕷️  Starting manga scraper...');

  // Use MangaDex feed — manga recently updated with EN chapters
  const { data } = await axios.get('https://api.mangadex.org/manga', {
    params: {
      limit: 50,
      'order[latestUploadedChapter]': 'desc', // recently updated
      'availableTranslatedLanguage[]': ['en'],
      'contentRating[]': ['safe', 'suggestive'],
      'includes[]': ['cover_art', 'author'],
    },
    timeout: 15000,
    headers: { 'User-Agent': 'MangaVerse/1.0' }
  });

  const results = data.data || [];
  console.log(`📦 Found ${results.length} recently updated manga`);

  const saved = [];
  for (const item of results) {
    try {
      // Quick check — does this manga have EN chapters?
      const mangaId = item.id;
      const hasChapters = await hasEnglishChapters(mangaId);
      if (!hasChapters) {
        console.log(`  ⏭ Skipping (no EN chapters): ${item.attributes.title?.en || mangaId}`);
        await sleep(200);
        continue;
      }

      const manga = await saveMangaToDB(item);
      console.log(`  ✅ Saved: ${manga.title}`);
      saved.push(manga);
      await sleep(300);
    } catch (err) {
      console.error(`  ❌ Failed:`, err.message);
    }
  }

  console.log(`\n✅ Scraped ${saved.length} manga with EN chapters`);

  // Auto-trigger chapter scraping for new manga
  try {
    const { scrapeAllChapters } = require('./chapterScraper');
    await scrapeAllChapters();
  } catch (err) {
    console.error('Chapter scrape error:', err.message);
  }

  return saved;
};

module.exports = { runScraper, saveMangaToDB };
