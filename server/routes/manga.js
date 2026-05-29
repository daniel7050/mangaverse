const router = require('express').Router();
const ctrl = require('../controllers/mangaController');

router.get('/genres', ctrl.getGenres);
router.get('/trending', ctrl.getTrending);
router.get('/search', ctrl.searchManga);
router.get('/', ctrl.getAllManga);
router.get('/:id', ctrl.getMangaById);
router.get('/:id/chapters', ctrl.getChapters);
router.post('/scrape', ctrl.triggerScrape);
router.post('/:id/scrape-chapters', ctrl.triggerChapterScrape);

module.exports = router;
