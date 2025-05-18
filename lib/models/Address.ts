import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  details: String
}, { timestamps: true });

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);
