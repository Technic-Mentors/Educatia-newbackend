import express from "express";
import University from "../Modules/University.js";
import errorHandling from "../Middlewares/ErrorHandling.js";
import uploadFile from "../Middlewares/FileFilter.js"
import cloudinaryv2 from "../Cloudinary.js"
const router = express.Router()
// const newUniversity = async () => {
//     await University.create({
//       name: 'Test University',
//       city: 'Lahore',
//       country: 'Pakistan',
//       intro: 'A top-tier university.',
//       subjects: 'Engineering, Business, Arts',
//       scholarships: 'Merit, Need-based'
//     });
//   };
  
//   newUniversity();
router.post("/addUni", uploadFile.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'img', maxCount: 1 }
  ]), errorHandling(async (req, res) => {
    const {name, city, country, intro, subjects, scholarships} = req.body
     if (!name || !city || !country || !intro)
        return res.status(400).json({message: "Please fill required fields"});

    let uniLogo;
    let uniImg;

    if (req.files.logo) {
        const uploaduniLogo = await cloudinaryv2.uploader.upload(req.files.logo[0].path);
        uniLogo = uploaduniLogo.secure_url;
    }
    if (req.files.img) {
        const uploaduniImg = await cloudinaryv2.uploader.upload(req.files.img[0].path);
        uniImg = uploaduniImg.secure_url;
    }

    const newUniPost = await University.create({
        name,
        city,
        country,
        intro,
        logo: uniLogo,
        img: uniImg,
        subjects,
        scholarships,
    });
    res.json(newUniPost);
}))

router.get("/getuni", errorHandling(async (req, res) => {
    const universities = await University.find();
    res.json(universities);
  }));


  router.get("/getUniByTitle/:title", errorHandling(async (req, res) => {
    const getUniByTitle = await University.findOne({ name: req.params.title })
    if (!getUniByTitle) return res.status(400).json({ message: "University not found" })
    res.json(getUniByTitle)
}))

router.get("/getUniById/:id", errorHandling(async (req, res) => {
    const getUniById = await University.findById(req.params.id).
    if (!getUniById) 
        return res.status(400).json({ message: "University not found" })
    res.json(getUniById)
}))
  
  export default router