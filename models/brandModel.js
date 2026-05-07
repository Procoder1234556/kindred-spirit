const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  }
}, { _id: false });

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },

  // 🚀 models array (unique by name)
  models: {
    type: [modelSchema],
    default: [],
    validate: {
      validator: function (models) {
        const names = models.map(m => m.name.toLowerCase());
        return names.length === new Set(names).size;
      },
      message: "Model names must be unique."
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🚀 Ensure unique index at DB level
brandSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Brand', brandSchema);
