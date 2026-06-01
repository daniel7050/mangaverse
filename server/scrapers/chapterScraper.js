const axios = require('axios');
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const fetchChapterList = async (mangaSourceUrl, limit = 500) => {
  try {
    const mangaId = mangaSourceUrl?.split('/title/')[1]?.split('/')[0];
    if (!mangaId) {
      console.log('  ⚠️  Could not extract MangaDex ID from:', mangaSourceUrl);
      return [];
    }

    console.log(`  🔍 Fetching chapters for MangaDex ID: ${mangaId}`);

    // MangaDex API supports offset pagination — fetch all chapters
    let allChapters = [];
    let offset = 0;
    const pageSize = 100;

    while (true) {
      const { data } = await axios.get('https://api.mangadex.org/chapter', {
        params: {
          manga: mangaId,
          limit: pageSize,
          offset,
          'translatedLanguage[]': ['en'],
          'order[chapter]': 'asc',
          'contentRating[]': ['safe', 'suggestive', 'erotica'],
          'includeExternalUrl': 0
        },
        timeout: 15000,
        headers: { 'User-Agent': 'MangaVerse/1.0' }
      });

      const chapters = data.data || [];
      allChapters = allChapters.concat(chapters);

      if (chapters.length < pageSize || allChapters.length >= data.total) break;
      offset += pageSize;
      await sleep(300); // respect rate limit between pages
    }

    console.log(`  ✅ Found ${allChapters.length} chapters`);
    return allChapters;
  } catch (err) {
    if (err.response?.status === 429) {
      console.log('  ⏳ Rate limited — waiting 5 seconds...');
      await sleep(5000);
    } else {
      console.error('  ❌ fetchChapterList error:', err.message);
    }
    return [];
  }
};

const saveChapters = async (manga) => {
  if (!manga.sourceUrl) {
    console.log(`  ⚠️  No sourceUrl for: ${manga.title}`);
    return 0;
  }

  const chapters = await fetchChapterList(manga.sourceUrl);
  if (!chapters.length) {
    console.log(`  ⚠️  No EN chapters found for: ${manga.title}`);
    return 0;
  }

  let saved = 0;
  for (const ch of chapters) {
    try {
      const attrs = ch.attributes;
      const chapterNum = parseFloat(attrs.chapter);
      if (isNaN(chapterNum)) continue;

      // Skip chapters with external URLs (not hosted on MangaDex)
      if (attrs.externalUrl) continue;

      await Chapter.findOneAndUpdate(
        { manga: manga._id, number: chapterNum },
        {
          manga: manga._id,
          number: chapterNum,
          title: attrs.title || '',
          sourceUrl: `https://mangadex.org/chapter/${ch.id}`,
          pages: []
        },
        { upsert: true, new: true }
      );
      saved++;
    } catch (err) {
      if (!err.code === 11000) console.error(`  Chapter save error:`, err.message);
    }
  }

  if (saved > 0) {
    await Manga.findByIdAndUpdate(manga._id, { chapterCount: saved });
    console.log(`  💾 Saved ${saved} chapters for: ${manga.title}`);
  }

  return saved;
};

// Scrape chapters for all manga with 0 chapters
const scrapeAllChapters = async () => {
  console.log('📖 Starting chapter scraper...');
  const mangaList = await Manga.find({ chapterCount: 0 }).limit(15);
  let total = 0;

  for (const manga of mangaList) {
    console.log(`\n📚 ${manga.title}`);
    const count = await saveChapters(manga);
    total += count;
    await sleep(800); // rate limit between manga
  }

  console.log(`\n✅ Chapter scraper done. Total chapters saved: ${total}`);
  return total;
};

// Scrape chapters for one specific manga
const scrapeChaptersForManga = async (mangaId) => {
  const manga = await Manga.findById(mangaId);
  if (!manga) throw new Error('Manga not found');
  console.log(`\n📚 Scraping chapters for: ${manga.title}`);
  const count = await saveChapters(manga);
  return count;
};

module.exports = { scrapeAllChapters, scrapeChaptersForManga, saveChapters };
