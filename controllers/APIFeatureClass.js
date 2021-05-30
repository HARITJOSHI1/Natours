module.exports = class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. Filtering
  filter = () => {
    const queryObj = { ...this.queryString }; // shallow copy
    const excludeParams = ['page', 'sort', 'limit', 'fields'];
    excludeParams.forEach((ptr) => delete queryObj[ptr]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);

    // To chain multiple functions on the query obj later
    this.query = this.query.find(queryStr);
    return this;
  };

  // 2. Sorting
  sort = () => {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      return this;
      // query = query.sort('(field name) (other field name ...)')
    } else {
      this.query = this.query.sort('-createdAt');
      return this;
    }
  };

  // 3. Limiting fields (projection)
  fields = () => {
    if (this.queryString.fields) {
      const fieldBy = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldBy);
      return this;
    } else {
      this.query = this.query.select('-__v'); // To exclude a field
      return this;
    }
  };

  // 4. Pagination
  page = (total) => {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    if (!this.queryString.limit) {
      this.query = this.query.limit(limit);
    }

    if (total <= skip) {
      throw new Error('Page out not found');
    }
    return this;
  };
};
