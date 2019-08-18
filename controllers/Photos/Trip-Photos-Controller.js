const path = require('path');
const Resize = require('../../util/local-functions/sharpImageResize');

const tripBannerUpload = async function (req, res, next) {
    const imagePath = path.join(__dirname, '../../public/images');
    const fileUpload = new Resize(imagePath);
    if (!req.file) {
        res.status(401).json({error: 'Please provide an image'});
    }
    const filename = await fileUpload.save(req.file.buffer);
    return res.status(200).json({ name: filename });
}

module.exports = { tripBannerUpload };