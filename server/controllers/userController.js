const User = require('../models/User');
const Manga = require('../models/Manga');

// GET /api/user/bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks').lean();
    res.json(user.bookmarks || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/user/bookmarks
exports.addBookmark = async (req, res) => {
  try {
    const { mangaId } = req.body;
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarks: mangaId } });
    res.json({ message: 'Bookmark added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/user/bookmarks/:mangaId
exports.removeBookmark = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: req.params.mangaId } });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/user/progress
exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('readingProgress.manga', 'title coverImage slug').lean();
    res.json(user.readingProgress || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/user/progress
exports.updateProgress = async (req, res) => {
  try {
    const { mangaId, lastChapter, lastPage } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.readingProgress.findIndex(p => p.manga.toString() === mangaId);
    if (idx >= 0) {
      user.readingProgress[idx] = { manga: mangaId, lastChapter, lastPage, updatedAt: new Date() };
    } else {
      user.readingProgress.push({ manga: mangaId, lastChapter, lastPage });
    }
    await user.save();
    res.json({ message: 'Progress updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
