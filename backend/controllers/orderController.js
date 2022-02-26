const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//Create new Order
exports.newOrder = catchAsyncErrors(async(req,res,next) =>{

    const {
        shippingInfo, 
        orderItems, 
        paymentInfo, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        paymentInfo, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    });

    res.status(201).json({
        success:true,
        order,
    });
});



// get Single Order

exports.getSingleOrder = catchAsyncErrors(async(req,res,next) =>{

    const order = await Order.findById(req.params.id).populate("user","name email"); // taking this user id and search it in user db and take name and email

    if(!order){
        return next(new ErrorHandler("Order mot found with this ID",404));
    }

    res.status(200).json({
        success:true,
        order,
    });
});

// get Logged in user Orders

exports.myOrders = catchAsyncErrors(async (req,res,next) => {

    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success:true,
        orders,
    });
});

// get all Orders -- Admin

exports.getAllOrders = catchAsyncErrors(async (req,res,next) => {

    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach(order =>{
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });
});

// update Order Status-- Admin

exports.updateOrder = catchAsyncErrors(async (req,res,next) => {

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this id",404));
    }
    
    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("You have already delivered this order",400));
    }
    //update after delivery
    order.orderItems.forEach(async(ord) =>{
        await updateStock(ord.product,ord.quantity);
    });

    order.orderStatus = req.body.status;

    // if status is shipped
    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }
    
    await order.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
    });
});



async function updateStock(id,quantity){

    const product = await Product.findById(id);

    product.stock -= quantity;

    await product.save({validateBeforeSave:false});
}




// Delete order -- Admin

exports.deleteOrder = catchAsyncErrors(async (req,res,next) => {

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this id",404));
    }
    await order.remove()

    res.status(200).json({
        success:true,
    });
});