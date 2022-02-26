// import in the controller the productModel

const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

// create product - admin
// exports.createProduct = async (req,res,next) =>{
//     const product = await Product.create(req.body);

//     res.status(201).json({
//         success:true,
//         product
//     })
// }
exports.createProduct = catchAsyncErrors(async (req,res,next) =>{
    //storing the id of the user after loging in
    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    });
});

// created a callback function, exporting controller from here
//get all products
exports.getAllProducts = catchAsyncErrors(async (req,res) =>{

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
    // const products = await Product.find();
    const products = await apiFeature.query;//Product.find();
    // res.status(200).json({message:"ROute is working fine"})
    res.status(200).json({
        success:true,
        products
    });
});


//update product - admin
exports.updateProduct = catchAsyncErrors(async(req,res,next) =>{
    let product = await Product.findById(req.params.id);

    if(!product){
        // return res.status(500).json({
        //     success:false,
        //     message:"product nor found"
        // })
        return next(new ErrorHandler("Product not found",404));
    }

    product =  await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    });
});


//Delete product

exports.deleteProduct = catchAsyncErrors(async(req,res,next) =>{
    const product = await Product.findById(req.params.id);

    if(!product){
        // return res.status(500).json({
        //     success:false,
        //     message:"product not found"
        // })
        return next(new ErrorHandler("Product not found",404));
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message:"Product deleted successfully!"
    });
});


//get single product details

exports.getProductDetails = catchAsyncErrors(async(req,res,next) =>{
    const product = await Product.findById(req.params.id);

    if(!product){
        // return res.status(500).json({
        //     success:false,
        //     message:"product not found"
        // })
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success: true,
        product,
        productCount,
    });

});

//create new Review or update review
exports.createProductReview = catchAsyncErrors(async(req,res,next) =>{

    const {rating,comment,productId} = req.body;

    const review = {
        user:req.user.id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) =>rev.user.toString() === req.user._id.toString());//will check review's user id and new id.
    
    if(isReviewed){
        product.reviews.forEach(rev => {
            if(rev.user.toString() === req.user._id.toString()){
                rev.rating = rating;
                rev.comment = comment;
            }   
        });
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    //update overall rating
    let avg = 0;
    product.reviews.forEach(rev => {
        avg +=rev.rating;
    })

    product.ratings = avg/product.reviews.length;


    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success:true,
        
    });
});

// get all reviews of a product

exports.getProductReviews = catchAsyncErrors(async(req,res,next) =>{

    const product = await Product.findById(req.query.id);

    if(!product)
    {
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews,
    });
});

// Delete review

exports.deleteReview = catchAsyncErrors(async(req,res,next) =>{

    const product = await Product.findById(req.query.productId);

    if(!product)
    {
        return next(new ErrorHandler("Product not found",404));
    }
    //keep those review we want
    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() != req.query.id.toString());

    //update overall rating
    let avg = 0;

    reviews.forEach(rev => {
        avg +=rev.rating;
    })

    const ratings = avg/reviews.length;

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    }
    );

    res.status(200).json({
        success:true,
    });
});