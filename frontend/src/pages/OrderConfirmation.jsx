import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="loading">Loading order details...</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p className="confirmation-message">Thank you for your purchase. Your order has been successfully placed.</p>

        <div className="order-details">
          <div className="detail-row">
            <span>Order Number:</span>
            <strong>{order.orderNumber}</strong>
          </div>
          <div className="detail-row">
            <span>Order Date:</span>
            <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <strong className="status">{order.orderStatus}</strong>
          </div>
          <div className="detail-row">
            <span>Total Amount:</span>
            <strong className="amount">${order.totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div className="order-items">
          <h3>Items Ordered</h3>
          {order.items.map((item) => (
            <div key={item._id} className="order-item">
              <span>{item.product.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="shipping-address">
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.street}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/orders')} className="btn-orders">
            View My Orders
          </button>
          <button onClick={() => navigate('/')} className="btn-continue">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
