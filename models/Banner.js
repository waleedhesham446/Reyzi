const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    id: { 
		type: Number,
		required: true,
	},
    image: { 
		type: String,
		required: true,
	},
    url: { 
		type: String,
		required: true,
	},
    isVip: { 
		type: Boolean,
		required: true,
        default: false,
	}
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;