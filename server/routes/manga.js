const router = require('express').Router();
const ctrl = require('../controllers/mangaController');

router.get('/', ctrl.getAllManga);
router.get('/trending', ctrl.getTrending);
router.get('/search', ctrl.searchManga);
router.get('/:id', ctrl.getMangaById);
router.get('/:id/chapters', ctrl.getChapters);
router.post('/scrape', ctrl.triggerScrape);

module.exports = router;
