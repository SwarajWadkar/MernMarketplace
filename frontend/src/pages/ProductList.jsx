import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/productSlice';
import { Link } from 'react-router-dom';
import './ProductList.css';

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, pagination, loading, error } = useSelector((state) => state.products);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    category: 'all',
    minPrice: 0,
    maxPrice: 10000
  });
  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef(null);

  const categoryImages = {
    Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    Fashion: 'https://images.unsplash.com/photo-1554568218-13fc7aa84002?w=500&h=500&fit=crop',
    Books: 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=500&h=500&fit=crop',
    Home: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=500&fit=crop',
    Toys: 'https://images.unsplash.com/photo-1617395877615-e5f2b9319c2e?w=500&h=500&fit=crop',
    Other: 'https://images.unsplash.com/photo-1512941691920-25bdb7edc1c7?w=500&h=500&fit=crop'
  };

  // Fetch products when filters change
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [filters.page, filters.limit, filters.search, filters.category, filters.minPrice, filters.maxPrice, dispatch]);

  // Sync search input when filters.search changes (e.g., when clearing filters)
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Handle filter changes with debouncing for search
  const handleFilterChange = useCallback((key, value) => {
    let parsedValue = value;
    
    // Parse numeric values
    if (key === 'minPrice' || key === 'maxPrice') {
      parsedValue = value === '' ? (key === 'minPrice' ? 0 : 10000) : parseFloat(value) || 0;
    }

    // For search, update the input state immediately but debounce the filter state
    if (key === 'search') {
      setSearchInput(value);
      
      // Clear previous timeout if it exists
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Debounce the filter state update - 1000ms delay gives time to type full words
      searchTimeoutRef.current = setTimeout(() => {
        setFilters((prev) => ({
          ...prev,
          search: value,
          page: 1
        }));
      }, 1000);
    } else {
      // For other filters, update immediately
      setFilters((prev) => {
        const updated = { ...prev, [key]: parsedValue };
        if (key !== 'page') {
          updated.page = 1;
        }
        return updated;
      });
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo(0, 0);
  };

  if (loading && products.length === 0) return <div className="loading">⏳ Loading products...</div>;
  
  if (error && products.length === 0) return <div className="error">❌ Error loading products: {error}</div>;

  return (
    <div className="product-list-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>🛍️ Welcome to Marketplace</h1>
          <p>Discover millions of products from trusted sellers</p>
        </div>
      </div>

      <div className="product-list-container">
        <aside className="filters">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <div className="category-grid">
              {['all', 'Electronics', 'Fashion', 'Books', 'Home', 'Sports', 'Toys', 'Other'].map((cat) => (
                <button
                  key={cat}
                  className={`category-btn ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', cat)}
                  style={{
                    backgroundImage: cat === 'all' ? 'none' : `url('${categoryImages[cat]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <span className="category-label">{cat === 'all' ? 'All' : cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>
        </aside>

        <section className="products-section">
          <div className="products-grid">
            {products.length === 0 ? (
              <p className="no-products">No products found</p>
            ) : (
              products.map((product) => (
                <Link to={`/product/${product._id}`} key={product._id} className="product-card">
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <img src={`https://picsum.photos/300/300?random=${product._id}`} alt={product.name} />
                    )}
                    <span className="product-badge">{product.isAuction ? '🔨 Auction' : '✓ Regular'}</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-category">📦 {product.category}</p>
                    <p className="price">${product.price.toFixed(2)}</p>
                    <div className="rating">
                      {product.rating ? `⭐ ${product.rating.toFixed(1)}` : '⭐ New'} ({product.reviewCount || 0})
                    </div>
                    <p className="stock-info">
                      {product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={page === pagination.page ? 'active' : ''}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductList;
