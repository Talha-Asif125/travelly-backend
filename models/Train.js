const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trainSchema = new Schema({
    trainName: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    depatureTime: { type: String, required: true },
    date: { type: String, required: true },
    price: { type: String, required: true },
    noOfSeats: { type: Number, required: true },
    description: { type: String, required: true },
    trainMainImg: { type: String },
    MaxBagage: { type: String, required: true },
    classType: { type: String, required: true },
    cancelCharges: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Train', trainSchema);


