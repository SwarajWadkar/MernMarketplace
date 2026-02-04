// Pagination helper
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Sorting helper
const getSortOrder = (sortQuery) => {
  if (!sortQuery) return { createdAt: -1 };

  const sortObj = {};
  const fields = sortQuery.split(',');

  fields.forEach((field) => {
    if (field.startsWith('-')) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return sortObj;
};

// Date utilities
const getDateRange = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return { startDate, endDate };
};

module.exports = {
  getPaginationParams,
  getSortOrder,
  getDateRange
};
