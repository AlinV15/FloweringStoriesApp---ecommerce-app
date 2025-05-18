import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  author: String,
  pages: Number,
  isbn: String,
  publisher: String,
  genre: String,
  language: String,
  publicationDate: Date
});

export default mongoose.models.Book || mongoose.model('Book', BookSchema);
