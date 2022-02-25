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