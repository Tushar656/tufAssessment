import express from 'express';
import Banner from '../models/Banner.js';

const router = express.Router();

//Create  a Banner
router.post('/create', async(req, res) => {
    const { title, description, image, redirectionLink, expire } = req.body;
    try {
        const banner = new Banner({
            title,
            expire,
            image,
            description,
            redirectionLink,
        });
        await banner.save();
        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a Banner
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, image, redirectionLink, expire, isHidden } = req.body;
    try {
        const banner = await Banner.findById(id);
        if (title) banner.title = title;
        if (description) banner.description = description;
        if (image) banner.image = image;
        if (redirectionLink) banner.redirectionLink = redirectionLink;
        if (expire) banner.expire = expire;
        if (isHidden !== undefined) banner.isHidden = isHidden;
        await banner.save();
        res.status(200).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Fetch all Banners
router.get('/', async (req, res) => {
    try {
        const users = await Banner.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;