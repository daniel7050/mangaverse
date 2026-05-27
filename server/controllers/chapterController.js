const Chapter = require('../models/Chapter');
const axios = require('axios');

// GET /api/chapters/:id
exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).lean();
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    await Chapter.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chapters/mangadex/:chapterId — fetch pages from MangaDex
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
