const Product = require("../models/productModel");
const ErrorHandler = require("../UTILS/errorhandler");
const catchAsyncErrors = require("../MIDDLEWARE/catchAsyncErrors");
const ApiFeatures = require("../UTILS/apifeatures");
const { rest } = require("lodash");


exports.createProduct = catchAsyncErrors(async (req, res, next) =>
{
    req.body.user = req.user.id;
    // console.log(req.body.user);

    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product,
    })
});

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

    let products = await apiFeature.query;
    // let filteredProductsCount = products.length;
    // apiFeature.pagination(resultPerPage);
    //  products = await apiFeature.query;

    res.status(200).json(
    {
    messsage:"Routes is working fine!!",
    success:true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount:10000,
});
});

exports.updateProduct = catchAsyncErrors(
    async (req, res, next) => {
        let product = await Product.findById(req.params.id);
        // if(!product)
        // {
        //     return res.status(500).json({
        //         success:false,
        //         message:"Invalid product ID"
        //     })
        // }
        if(!product){
            return next(new ErrorHandler("Product not found", 404) );
    
        }
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {new:true,
        runValidators:true,
        useFindAndModify:false,
    });
    res.status(200).json({
        success:true,
        product,
    })
    }
);

exports.deleteProduct = catchAsyncErrors(
    async (req, res, next) =>
{
    const product = await Product.findById(req.params.id);
    if(!product){
        return res.status(500).json({
            success:false,
        })

    }
    await product.remove();
    res.status(200).json({
        success:true,
        message:`product id ${req.params.id} has been deleted`,
    })
}
);

exports.getProductDetails = catchAsyncErrors(
    async (req,res, next) =>
{
    console.log("Backend is receiving Product ID",req.params.id);
    const product = await Product.findById(req.params.id);
    console.log("Backend is retreving product");
    if(!product){
        return next(new ErrorHandler("Product id not found", 404) );

    }
    res.status(200).json({
        success:true,
        product,
    })   
}
)

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const {rating, comment, productId} = req.body;
   const review = {
       user:req.user._id,
       name:req.user.name,
       rating:Number(rating),
       comment,

   } ;
//    console.log(review);
   const product = await Product.findById(productId);
   
   const isReviewed  = product.reviews.find(
       (rev)=> rev.user.toString()===req.user._id.toString());
   console.log({isReviewed})
   if(!isReviewed)
   {
    // console.log("if statement")
       product.reviews.forEach((rev)=>
        {
            if(rev.user.toString() === req.user._id.toString())
            (rev.rating=rating),
            (rev.comment = comment);
            
        });

   } else {
    console.log("else statement")
       product.reviews.push(review);
       product.numOfReviews = product.reviews.length;
   }
   let avg = 0; 
   product.ratings = product.reviews.forEach((rev)=>
    {
        avg+=rev.rating;
    }) ;
    product.ratings = avg / product.reviews.length;

    await product.save({validateBeforeSave:false });

    res.status(200).json({
        success:true,
        message:comment,
        product,
    });

});

//get all product reviews at once

exports.getProductReviews = catchAsyncErrors(async (req, res, next) =>
 {
     const product = await Product.findById(req.query.id);

     if(!product)
     {
         return next(new ErrorHandler( `Product id ${req.query.id} not found`, 404));
     }
     res.status(200).json({
         success:true,
         reviews:product.reviews,
     });
 })

 //delete review

 exports.deleteReviews = catchAsyncErrors(async (req, res, next) =>
 {
     const product = await Product.findById(req.query.productId);

     if(!product)
     {
         return next(new ErrorHandler( `Product id ${req.query.id} not found`, 404));
     }
     const reviews = product.reviews.filter(rev=> rev._id.toString() !== req.query.id.toString());

     let avg = 0; 
     reviews.forEach((rev)=>
      {
          avg+=rev.rating;
      }) ;
      const ratings = avg / reviews.length;
      const numOfReviews = reviews.length;

  
      await Product.findByIdAndUpdate(
          req.query.productId,{
              reviews, 
              ratings, 
              numOfReviews,

          },{
          new:true,
          runValidators:true,
          useFindAndModify:false,
        });



     res.status(200).json({
         success:true,
         reviews:product.reviews,
     });
 })