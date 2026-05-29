const axios = require('axios');
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');

// Fetch chapter list for a manga from MangaDex
const fetchChapterList = async (mangaSourceUrl, limit = 100) => {
  try {
    // Extract MangaDex manga ID from sourceUrl
    const mangaId = mangaSourceUrl?.split('/title/')[1]?.split('/')[0];
    if (!mangaId) return [];

    const { data } = await axios.get('https://api.mangadex.org/chapter', {
      params: {
        manga: mangaId,
        limit,
        'translatedLanguage[]': 'en',
        'order[chapter]': 'asc',
        'contentRating[]': ['safe', 'suggestive']
      },
      timeout: 10000
    });
    return data.data || [];
  } catch (err) {
    console.error('fetchChapterList error:', err.message);
    return [];
  }
};

// Save chapters for a manga to DB (without pages — pages fetched on demand)
const saveChapters = async (manga) => {
  const chapters = await fetchChapterList(manga.sourceUrl);
  if (!chapters.length) return 0;

  let saved = 0;
  for (const ch of chapters) {
    try {
      const attrs = ch.attributes;
      const chapterNum = parseFloat(attrs.chapter) || 0;
      if (!chapterNum) continue;

      await Chapter.findOneAndUpdate(
        { manga: manga._id, number: chapterNum },
        {
          manga: manga._id,
          number: chapterNum,
          title: attrs.title || `Chapter ${chapterNum}`,
          sourceUrl: `https://mangadex.org/chapter/${ch.id}`,
          pages: [] // populated on-demand when reader opens
        },
        { upsert: true, new: true }
      );

      // Update manga chapter count
      saved++;
    } catch (err) {
      if (!err.message.includes('duplicate')) {
        console.error(`Chapter save error:`, err.message);
      }
    }
  }

  // Update chapterCount on manga
  if (saved > 0) {
    await Manga.findByIdAndUpdate(manga._id, { chapterCount: saved });
  }

  return saved;
};

// Scrape chapters for all manga in DB that have 0 chapters
const scrapeAllChapters = async () => {
  console.log('📖 Starting chapter scraper...');
  const mangaList = await Manga.find({ chapterCount: 0 }).limit(10);
  let total = 0;
  for (const manga of mangaList) {
    console.log(`  Scraping chapters for: ${manga.title}`);
    const count = await saveChapters(manga);
    total += count;
    // Respect rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`✅ Chapter scraper done. Saved ${total} chapters.`);
  return total;
};

// Scrape chapters for one specific manga
const scrapeChaptersForManga = async (mangaId) => {
  const manga = await Manga.findById(mangaId);
  if (!manga) throw new Error('Manga not found');
  const count = await saveChapters(manga);
  return count;
};

module.exports = { scrapeAllChapters, scrapeChaptersForManga, saveChapters };
