const mongoose = require('mongoose');
const { Schema } = mongoose;

const resturentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  district: { type: Schema.Types.ObjectId, ref: 'ResturentDistrict', required: true },
  address: { type: String, required: true },
  tableCount: { type: Number, integer: true, required: true },
  resturentImages: { type: [String], required: true },
  registrationImages: { type: [String], required: true },
  staffAmount: { type: Number, integer: true, required: true },
  mobileNo: { type: String, required: true },
  status: { type: String, enum: ['APPROVED', 'DECLINED', 'PENDING'], default: 'PENDING' },
});

const Resturent = mongoose.model('Resturent', resturentSchema);

module.exports = Resturent;
