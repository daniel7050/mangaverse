const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // all user routes require auth

router.get('/bookmarks', ctrl.getBookmarks);
router.post('/bookmarks', ctrl.addBookmark);
router.delete('/bookmarks/:mangaId', ctrl.removeBookmark);
router.get('/progress', ctrl.getProgress);
router.post('/progress', ctrl.updateProgress);

module.exports = router;
