const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  manga: { type: mongoose.Schema.Types.ObjectId, ref: 'Manga', required: true, index: true },
  number: { type: Number, required: true },
  title: { type: String, default: '' },
  pages: [{ pageNumber: { type: Number, required: true }, imageUrl: { type: String, required: true } }],
  viewCount: { type: Number, default: 0 },
  sourceUrl: { type: String, default: '' },
}, { timestamps: true });

chapterSchema.index({ manga: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', chapterSchema);
