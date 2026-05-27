const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  author: { type: String, default: 'Unknown' },
  artist: { type: String, default: 'Unknown' },
  genres: [{ type: String, trim: true }],
  status: { type: String, enum: ['ongoing', 'completed', 'hiatus'], default: 'ongoing' },
  rating: { type: Number, default: 0, min: 0, max: 10 },
  viewCount: { type: Number, default: 0 },
  chapterCount: { type: Number, default: 0 },
  sourceUrl: { type: String, default: '' },
  lastScraped: { type: Date, default: null },
  isTrending: { type: Boolean, default: false },
  isLatest: { type: Boolean, default: false },
}, { timestamps: true });

mangaSchema.index({ title: 'text', description: 'text', genres: 'text' });

module.exports = mongoose.model('Manga', mangaSchema);
