const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"product name is required"],
            trim:true
        },
        description:{
            type:String,
            required:[true,"product description is required"]
        },
        price:{
            type:Number,
            required:[true,"product price is required"],
            maxLength:[6,"The price exceeeds threshold"]
        },
        ratings:{
            type:Number,
            default:0
        },
        images:[
           {public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            },
        }
            
        ],
        category:{
            type:String,
            required:[true,"Product needs a category"],
            

        },
        stock:{
            type:Number,
            requried:[true,"Product Stock is required"],
            maxLength:[4,"The stock quantity exceeds threshold"],
            default:1
        },
        numOfReviews:{
            type:Number,
            default:0
        },
        reviews:[
            {
                user:{
                    type:mongoose.Schema.ObjectId,
                    ref:"User",
                    requried:true,
        
                }, 
                
                name:{
                    type:String,
                    required:true,
                },
                rating:{
                    type:Number,
                    required:true,
                },
                comment:{
                    type:String,
                    required:true,
                }
            }
        ],
        user:{
            type:mongoose.Schema.ObjectId,
            ref:"User",
            requried:true,

        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }
)

module.exports = mongoose.model("Product",productSchema);
