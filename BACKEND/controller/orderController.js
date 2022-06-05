const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../UTILS/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");



//create a new order
exports.newOrder = catchAsyncErrors(async (req, res, next) =>
{
    const{shippingInfo, 
        orderItems, 
        paymentInfo, 
        itemPrice, 
        taxPrice, 
        shippingPrice,
        totalPrice} = req.body;
    const order = await Order.create(
        {shippingInfo, 
            orderItems, 
            paymentInfo, 
            itemPrice, 
            taxPrice, 
            shippingPrice,
            totalPrice,
            paidAt:Date.now(),
            user: req.user._id,
        }
    ) ;
    res.status(201).json({
        success:true,
        message:"Your order hase been created",
        order
    })
});

//get single order details

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) =>{
    const order = await Order.findById(req.params.id).populate("user","nameemail");

    if(!order)
    {
        return next(new ErrorHandler("Order not found with this id"), 404);

    }
    res.status(200).json({
        success:true,
        order,
    });
});

//get all orders for single user
exports.myOrder = catchAsyncErrors(async (req, res, next) =>{
    const order = await Order.find({user:req.user._id});

    res.status(200).json({
        success:true,
        order,
    });
});

//get all order for admin
exports.allOrder = catchAsyncErrors(async (req, res, next) =>{
    const orders = await Order.find();
    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.taxPrice;
        
    });

    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });
});
//update order status-admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) =>{
    const order = await Order.findById(req.params.id);
    if(!order)
    {
        return next(new ErrorHandler("Order not found with this id"), 404);

    }
    if(order.orderStatus==="Delivered")
    {
        return next(new ErrorHandler("this product has been delivered",404))
    }
    order.orderItems.forEach(async (oo)=>
        {
            await updateStock(oo.product, oo.quantity);
        })
  order.orderStatus = req.body.status;
  if(req.body.status==="Delivered")
  {
  order.deliveredAt = Date.now();
  }
  await order.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        order,
    });
});

async function updateStock(id,quantity)
{
const product = await Product.findById(id);
product.Stock -= quantity ;
await product.save({validateBeforeSave:true});

}

//delete order admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) =>{
    const order = await Order.findById(req.params.id);
    if(!order)
    {
        return next(new ErrorHandler("this order does not exist",404));
    }
    await order.remove();


    res.status(200).json({
        success:true,
    });
});