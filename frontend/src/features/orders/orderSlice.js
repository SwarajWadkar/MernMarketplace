import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrder = createAsyncThunk('orders/createOrder', async (data, { rejectWithValue }) => {
  try {
    console.log('Creating order with data:', data);
    const response = await api.post('/orders', data);
    console.log('Order creation response:', response.data);
    
    if (!response.data.order) {
      return rejectWithValue('Invalid order response from server');
    }
    
    return response.data.order;
  } catch (error) {
    console.error('Order creation error:', error);
    const message = error.response?.data?.message || error.message || 'Failed to create order';
    return rejectWithValue(message);
  }
});

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch orders';
    return rejectWithValue(message);
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data.order;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch order';
    return rejectWithValue(message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    pagination: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default orderSlice.reducer;
