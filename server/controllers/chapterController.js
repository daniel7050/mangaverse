const Chapter = require('../models/Chapter');
const axios = require('axios');

const fetchPagesFromMangaDex = async (sourceUrl) => {
  const mdId = sourceUrl?.split('/chapter/')[1];
  if (!mdId) return [];

  const { data } = await axios.get(
    `https://api.mangadex.org/at-home/server/${mdId}`,
    {
      timeout: 10000,
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    }
  );

  const baseUrl = data.baseUrl;
  const hash = data.chapter.hash;

  // Try data-saver (smaller images) as fallback
  const imageList = data.chapter.data?.length ? data.chapter.data : data.chapter.dataSaver;
  const folder = data.chapter.data?.length ? 'data' : 'data-saver';

  return imageList.map((filename, i) => ({
    pageNumber: i + 1,
    imageUrl: `${baseUrl}/${folder}/${hash}/${filename}`
  }));
};

// GET /api/chapters/by-manga/:mangaId/:chapterNum
exports.getChapterByNumber = async (req, res) => {
  try {
    const { mangaId, chapterNum } = req.params;
    let chapter = await Chapter.findOne({ manga: mangaId, number: parseFloat(chapterNum) });
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    // Return cached pages if available
    if (chapter.pages?.length) {
      await Chapter.findByIdAndUpdate(chapter._id, { $inc: { viewCount: 1 } });
      return res.json(chapter);
    }

    // Fetch pages from MangaDex
    try {
      const pages = await fetchPagesFromMangaDex(chapter.sourceUrl);
      if (pages.length) {
        chapter.pages = pages;
        await chapter.save();
      }
    } catch (fetchErr) {
      console.error('MangaDex fetch error:', fetchErr.message);
      // Return chapter without pages — frontend handles empty state
    }

    await Chapter.findByIdAndUpdate(chapter._id, { $inc: { viewCount: 1 } });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chapters/:id
exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    if (!chapter.pages?.length && chapter.sourceUrl) {
      try {
        const pages = await fetchPagesFromMangaDex(chapter.sourceUrl);
        if (pages.length) { chapter.pages = pages; await chapter.save(); }
      } catch (fetchErr) {
        console.error('MangaDex fetch error:', fetchErr.message);
      }
    }

    await Chapter.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chapters/mangadex/:chapterId
exports.getMangaDexPages = async (req, res) => {
  try {
    const pages = await fetchPagesFromMangaDex(
      `https://mangadex.org/chapter/${req.params.chapterId}`
    );
    res.json({ pages, total: pages.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
