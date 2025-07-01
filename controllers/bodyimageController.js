    import cloudinary from '../config/cloudinary.js';
    import BodyImage from '../models/bodyimage.js';

    export const createBodyImage = async (req, res) => {
        console.log(req.body)
    try {
        if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const uploadResult = await cloudinary.uploader.upload(req.file.path);

        const newImage = new BodyImage({
        img: uploadResult.secure_url,
        userId: req.body.userId, // or req.user._id depending on your auth setup
        });

        const savedImage = await newImage.save();

        res.status(201).json({
        success: true,
        message: 'Image uploaded and saved successfully!',
        data: savedImage,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
        });
    }
    };
