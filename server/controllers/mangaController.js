const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const { runScraper } = require('../scrapers/mangaScraper');

// GET /api/manga — paginated, filterable, sortable
exports.getAllManga = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { genre, status, sort } = req.query;

    const filter = {};
    if (genre) filter.genres = genre;
    if (status && status !== 'all') filter.status = status;

    const sortMap = {
      viewCount: { viewCount: -1 },
      rating:    { rating: -1 },
      title:     { title: 1 },
      newest:    { createdAt: -1 },
    };
    const sortQuery = sortMap[sort] || { createdAt: -1 };

    const [manga, total] = await Promise.all([
      Manga.find(filter).sort(sortQuery).skip(skip).limit(limit).lean(),
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
    const { q, genre } = req.query;
    if (!q && !genre) return res.json([]);
    const filter = {};
    if (genre) filter.genres = genre;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
    const manga = await Manga.find(filter).limit(24).lean();
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/manga/genres — distinct genres list
exports.getGenres = async (req, res) => {
  try {
    const genres = await Manga.distinct('genres');
    res.json(genres.filter(Boolean).sort());
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

// POST /api/manga/scrape
exports.triggerScrape = async (req, res) => {
  try {
    res.json({ message: 'Scrape started in background' });
    runScraper().catch(console.error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
