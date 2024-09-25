const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController')
const chatroomController = require('../controllers/chatroomController')

router.route("/").get(authController.protect,chatroomController.getAllRooms);
// router.route('/create').post(authController.protect,chatroomController.createRoom);
router.route('/:roomId').patch(authController.protect,chatroomController.postMessage);
router.route('/:roomId').get(authController.protect,chatroomController.enterRoom);
// router.route('/:roomId').get(authController.protect,chatroomController.getMessage);

module.exports = router;