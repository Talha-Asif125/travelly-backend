const mongoose = require('mongoose')

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true 
    },
    type: {  
        type: String
    },
    city: {  
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    address: {
        type: String, 
        required: true
    },
    zip: {
        type: Number,
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    contactNo: {
        type: Number,
        required: true
    },
    description: { 
        type: String,
        required: true
    },
    cheapestPrice: { 
        type: Number,
        required: true 
    },
    rating: {
        type: Number, 
        min: 0,
        max: 5
    },
    HotelImgs: { 
        type: [String]
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: true
    },
    sustainability: {
        type: Boolean,
        default: false
    },
    availableWork: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }) 

module.exports = mongoose.model("Hotel", HotelSchema)    