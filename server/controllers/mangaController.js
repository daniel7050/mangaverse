const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const { runScraper } = require('../scrapers/mangaScraper');

// GET /api/manga — paginated list
exports.getAllManga = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const genre = req.query.genre;
    const filter = genre ? { genres: genre } : {};
    const [manga, total] = await Promise.all([
      Manga.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Manga.countDocuments(filter)
    ]);
    res.json({ manga, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/manga/trending
exports.getTrending = async (req, res) => {
  try {
    const manga = await Manga.find().sort({ viewCount: -1 }).limit(10).lean();
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/manga/search?q=
exports.searchManga = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    const manga = await Manga.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(20).lean();
    // Fallback to regex if text index not hit
    if (!manga.length) {
      const results = await Manga.find({ title: { $regex: q, $options: 'i' } }).limit(20).lean();
      return res.json(results);
    }
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/manga/:id
exports.getMangaById = async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id).lean();
    if (!manga) return res.status(404).json({ error: 'Manga not found' });
    await Manga.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/manga/:id/chapters
exports.getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find({ manga: req.params.id })
      .sort({ number: 1 }).select('-pages').lean();
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/manga/scrape (admin trigger)
exports.triggerScrape = async (req, res) => {
  try {
    res.json({ message: 'Scrape started in background' });
    runScraper().catch(console.error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
