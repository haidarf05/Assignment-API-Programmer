const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "profile_image");
  },
  filename: function (req, file, cb) {
    try {
      const email = req.decoded?.email || "unknown";
      const safeEmail = email.replace(/[@.]/g, "_");
      const ext = path.extname(file.originalname) || ".jpg";
      const filename = `${safeEmail}${ext}`;
      cb(null, filename);
    } catch (error) {
      cb(error);
    }
  },
});

const formatImage = (req, file, cb) => {
  const formatType = ["image/jpeg", "image/png"];

  if (!formatType.includes(file.mimetype)) {
    return cb(new Error("Format Image tidak sesuai"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: formatImage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("profile_image");

const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            status: 102,
            message: "Ukuran file maksimal 2MB",
            data: null,
          });
        }
      }

      return res.status(400).json({
        status: 102,
        message: err.message,
        data: null,
      });
    }
    next();
  });
};

module.exports = { uploadMiddleware };
