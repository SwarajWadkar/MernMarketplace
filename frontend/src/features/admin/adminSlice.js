import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const blockUser = createAsyncThunk('admin/blockUser', async (userId, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/users/${userId}/block`);
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.stats;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    stats: null,
    loading: false,
    error: null,
    pagination: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export default adminSlice.reducer;
