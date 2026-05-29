const Chapter = require('../models/Chapter');
const axios = require('axios');

// GET /api/chapters/:id — get chapter with pages (fetch from MangaDex if needed)
exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    // If pages already cached, return them
    if (chapter.pages?.length) {
      await Chapter.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
      return res.json(chapter);
    }

    // Otherwise fetch from MangaDex
    const mdId = chapter.sourceUrl?.split('/chapter/')[1];
    if (!mdId) return res.json(chapter);

    const { data } = await axios.get(`https://api.mangadex.org/at-home/server/${mdId}`, { timeout: 8000 });
    const baseUrl = data.baseUrl;
    const hash = data.chapter.hash;
    const pages = data.chapter.data.map((filename, i) => ({
      pageNumber: i + 1,
      imageUrl: `${baseUrl}/data/${hash}/${filename}`
    }));

    // Cache pages in DB
    chapter.pages = pages;
    await chapter.save();
    await Chapter.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chapters/by-manga/:mangaId/:chapterNum
exports.getChapterByNumber = async (req, res) => {
  try {
    const { mangaId, chapterNum } = req.params;
    let chapter = await Chapter.findOne({ manga: mangaId, number: parseFloat(chapterNum) });

    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    // Fetch pages if not cached
    if (!chapter.pages?.length && chapter.sourceUrl) {
      const mdId = chapter.sourceUrl.split('/chapter/')[1];
      if (mdId) {
        const { data } = await axios.get(`https://api.mangadex.org/at-home/server/${mdId}`, { timeout: 8000 });
        const baseUrl = data.baseUrl;
        const hash = data.chapter.hash;
        chapter.pages = data.chapter.data.map((filename, i) => ({
          pageNumber: i + 1,
          imageUrl: `${baseUrl}/data/${hash}/${filename}`
        }));
        await chapter.save();
      }
    }

    await Chapter.findByIdAndUpdate(chapter._id, { $inc: { viewCount: 1 } });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chapters/mangadex/:chapterId
exports.getMangaDexPages = async (req, res) => {
  try {
    const { data } = await axios.get(
      `https://api.mangadex.org/at-home/server/${req.params.chapterId}`,
      { timeout: 8000 }
    );
    const baseUrl = data.baseUrl;
    const hash = data.chapter.hash;
    const pages = data.chapter.data.map((filename, i) => ({
      pageNumber: i + 1,
      imageUrl: `${baseUrl}/data/${hash}/${filename}`
    }));
    res.json({ pages, total: pages.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
