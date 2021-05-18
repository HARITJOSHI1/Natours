    // BUILDING A QUERY

    // 1. Basic Filtering
    // const queryObj = {...req.query};  // shallow copy
    // const excludeParams = ['page', 'sort', 'limit', 'fields'];
    // excludeParams.forEach(ptr => delete queryObj[ptr]);

    // 2. Advanced Filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

    // // To chain multiple functions on the query obj later
    // let query = tours.find(JSON.parse(queryStr));

    // // 3. Sorting
    // if(req.query.sort){
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    //   // query = query.sort('(sort-criteria) (other sort criteria ...)')
    // }

    // else{
    //   query = query.sort('-createdAt');
    // }

    // // 4. Limiting fields (projection)
    // if(req.query.fields){
    //   const fieldBy = req.query.fields.split(',').join(' ');
    //   query = query.select(fieldBy);
    // }
    // else{
    //   query = query.select('-__v');   // To exclude a field
    // }

    // // 5. Pagination
    // const page = +req.query.page || 1;
    // const limit = +req.query.limit || 10;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // if(!req.query.limit){
    //   query = query.limit(limit);
    // }

    // const total = await tours.countDocuments();

    // if(total <= skip){
    //   throw new Error("Page out of bound");
    // }