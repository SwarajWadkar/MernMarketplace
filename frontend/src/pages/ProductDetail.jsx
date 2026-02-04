import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import { placeBid, fetchBids } from '../features/auction/auctionSlice';
import { useSocket } from '../hooks/useCustom';
import io from 'socket.io-client';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { bids } = useSelector((state) => state.auction);
  const [quantity, setQuantity] = useState(1);
  const [bidAmount, setBidAmount] = useState('');
  const [liveUpdates, setLiveUpdates] = useState([]);

  useEffect(() => {
    dispatch(fetchProductById(id));
    if (selectedProduct?.isAuction) {
      dispatch(fetchBids(id));
    }
  }, [id, dispatch, selectedProduct?.isAuction]);

  // Socket.io for real-time auction
  useEffect(() => {
    if (selectedProduct?.isAuction) {
      const socket = io('http://localhost:5000');
      socket.emit('join-auction', id);

      socket.on('bid-update', (data) => {
        setLiveUpdates((prev) => [...prev, data]);
      });

      return () => {
        socket.emit('leave-auction', id);
        socket.disconnect();
      };
    }
  }, [selectedProduct?.isAuction, id]);

  const handleAddToCart = () => {
    if (!user) {
      alert('Please login first');
      return;
    }
    dispatch(addToCart({ productId: id, quantity }));
  };

  const handlePlaceBid = () => {
    if (!user) {
      alert('Please login first');
      return;
    }
    dispatch(placeBid({ productId: id, amount: parseFloat(bidAmount) }));
    setBidAmount('');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!selectedProduct) return <div className="error">Product not found</div>;

  const { name, description, price, images, seller, stock, rating, isAuction, currentBidAmount } = selectedProduct;

  return (
    <div className="product-detail">
      <div className="product-images">
        {images && images.length > 0 ? (
          <img src={images[0].url} alt={name} />
        ) : (
          <div className="no-image">No image</div>
        )}
      </div>

      <div className="product-info">
        <h1>{name}</h1>
        <div className="seller-info">
          <p>
            Seller: <strong>{seller?.name}</strong>
          </p>
          <p>Rating: {seller?.averageRating || 0}★</p>
        </div>

        <p className="description">{description}</p>

        {isAuction ? (
          <div className="auction-section">
            <h3>Current Bid: ${currentBidAmount || price}</h3>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter your bid"
              min={currentBidAmount ? currentBidAmount * 1.05 : price}
            />
            <button onClick={handlePlaceBid} className="btn-bid">
              Place Bid
            </button>

            <div className="live-bids">
              <h4>Live Bids</h4>
              {liveUpdates.length > 0 ? (
                liveUpdates.map((update, index) => (
                  <div key={index} className="bid-item">
                    <p>${update.bidAmount} by {update.bidder}</p>
                  </div>
                ))
              ) : (
                <p>No bids yet</p>
              )}
            </div>
          </div>
        ) : (
          <div className="regular-product">
            <h3 className="price">${price}</h3>
            <p className="stock">Stock: {stock}</p>
            <div className="quantity-section">
              <input
                type="number"
                min="1"
                max={stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="btn-add-cart"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
