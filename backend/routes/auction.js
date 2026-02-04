const express = require('express');
const {
  placeBid,
  getBids,
  getUserBids,
  endAuction
} = require('../controllers/auctionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/:productId/bid', protect, placeBid);
router.get('/:productId/bids', getBids);
router.get('/user/bids', protect, getUserBids);
router.post('/:productId/end', protect, authorize('admin'), endAuction);

module.exports = router;
