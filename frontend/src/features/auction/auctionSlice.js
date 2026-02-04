import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const placeBid = createAsyncThunk('auction/placeBid', async (payload, { rejectWithValue }) => {
  try {
    const { productId, amount } = payload;
    const response = await api.post(`/auction/${productId}/bid`, { amount });
    return response.data.bid;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const fetchBids = createAsyncThunk('auction/fetchBids', async (productId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/auction/${productId}/bids`);
    return response.data.bids;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const fetchUserBids = createAsyncThunk('auction/fetchUserBids', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/auction/user/bids', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const auctionSlice = createSlice({
  name: 'auction',
  initialState: {
    bids: [],
    userBids: [],
    loading: false,
    error: null,
    pagination: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeBid.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.bids = action.payload;
      })
      .addCase(fetchUserBids.fulfilled, (state, action) => {
        state.userBids = action.payload.bids;
        state.pagination = action.payload.pagination;
      });
  }
});

export default auctionSlice.reducer;
