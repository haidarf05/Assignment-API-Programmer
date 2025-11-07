const validator = require("validator");

const validateEmial = (type) => {
  return (req, res, next) => {
    try {
      const { email, first_name, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          status: 102,
          message: "Semua field wajib diisi",
          data: null,
        });
      }
      if (type === "register") {
        if (!first_name) {
          return res.status(400).json({
            status: 102,
            message: "Semua field wajib diisi",
            data: null,
          });
        }
      }
      //   }
      if (password.length < 8) {
        return res.status(400).json({
          status: 102,
          message: "Password minimal 8 karakter",
          data: null,
        });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({
          status: 102,
          message: "Paramter email tidak sesuai format",
          data: null,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  };
};

module.exports = validateEmial;
