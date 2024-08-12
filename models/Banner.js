import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    expire: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    startAt: {
        type: Date,
        default: Date.now
    },
    redirectionLink: {
        type: String
    },
    isHidden: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
