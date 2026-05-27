const router = require('express').Router();
const ctrl = require('../controllers/chapterController');

router.get('/:id', ctrl.getChapter);
router.get('/mangadex/:chapterId', ctrl.getMangaDexPages);

module.exports = router;
