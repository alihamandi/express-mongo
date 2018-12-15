/*
 *  MONGO Table Post Model
 *
 */

// Dependency
const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This one help us using the populate
    required: true
  },
  title: {
    type: String,
    required: [true, 'You have to set a title !']
  },
  description: String
});

module.exports = mongoose.model('Post', postSchema);
