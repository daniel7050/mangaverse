const router = require('express').Router();
const ctrl = require('../controllers/chapterController');

router.get('/by-manga/:mangaId/:chapterNum', ctrl.getChapterByNumber);
router.get('/mangadex/:chapterId', ctrl.getMangaDexPages);
router.get('/:id', ctrl.getChapter);

module.exports = router;
