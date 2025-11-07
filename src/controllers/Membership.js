const path = require("path");
const fs = require("fs");
const UserCollection = require("../models/Membership");
const { generateTokenWOExp, generateTokenWithExp } = require("../helpers/jwt");
const { hashPass, checkPass } = require("../helpers/hashPass");
const db = require("../../config/db.connect");
class Controller {
  static async registration(req, res, next) {
    try {
      const { email, first_name, last_name, password } = req.body || {};

      const checkUserEmail = "SELECT id FROM users WHERE email = $1";
      const { rows: existing } = await db.query(checkUserEmail, [email]);
      if (existing.length > 0) {
        return res
          .status(400)
          .json({ status: 102, message: "Email sudah terdaftar", data: null });
      }

      let createUser = `
      INSERT INTO users (email, first_name, last_name, password, created_on, updated_on)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `;
      await db.query(createUser, [
        email,
        first_name,
        last_name,
        hashPass(password),
      ]);
      return res.status(200).json({
        status: 0,
        message: "Registrasi berhasil dilakukan",
        data: null,
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body || {};

      const findUser = "SELECT * FROM users WHERE email = $1";
      const { rows: users } = await db.query(findUser, [email]);
      const newUser = users[0];
      if (!users && !checkPass(password, newUser.password)) {
        return res.status(400).json({
          status: 102,
          message: "Username atau password salah",
          data: null,
        });
      }

      const tokenHashed = await generateTokenWithExp({ email: newUser.email });
      return res.status(200).json({
        status: 0,
        message: "Login sukses",
        data: { token: tokenHashed },
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  static async profile(req, res, next) {
    try {
      const { email } = req.decoded;

      if (!email) {
        return res.satus(404).json({
          status: 104,
          message: "Email tidak terdaftar",
          data: null,
        });
      }

      const findUser =
        "SELECT email, first_name, last_name, profile_image FROM users WHERE email = $1";
      const { rows } = await db.query(findUser, [email]);

      const user = rows[0];
      if (!user) {
        return res.satus(404).json({
          status: 104,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      return res.status(200).json({
        status: 0,
        message: "Sukses",
        data: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_image:
            user.profile_image || "https://yoururlapi.com/profile.jpeg",
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  static async update(req, res, next) {
    try {
      const { first_name, last_name } = req.body || {};
      const { email } = req.decoded;

      if (!first_name && !last_name) {
        return res.status(400).json({
          status: 102,
          message: "Tidak ada field yang diupdate",
          data: null,
        });
      }

      const updateUser = `
      UPDATE users
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        updated_on = NOW()
      WHERE email = $3
      RETURNING email, first_name, last_name, profile_image
    `;

      if (!updateUser) {
        return res.status(404).json({
          status: 104,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      const { rows } = await db.query(updateUser, [
        first_name,
        last_name,
        email,
      ]);
      const updatedUser = rows[0];

      return res.status(200).json({
        status: 0,
        message: "Update Pofile berhasil",
        data: {
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          profile_image:
            updatedUser.profile_image || "https://yoururlapi.com/profile.jpeg",
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  static async image(req, res, next) {
    try {
      const { email } = req.decoded;

      if (!req.file || !req.file.filename) {
        return res.status(400).json({
          status: 102,
          message: "Tidak ada file yang ditambahkan",
          data: null,
        });
      }

      const findUser = "SELECT * FROM users WHERE email = $1";
      const { rows } = await db.query(findUser, [email]);
      const user = rows[0];

      if (!findUser) {
        return res.status(404).json({
          status: 104,
          message: "User tidak ditemukan",
          data: null,
        });
      }
      let imageUrl = findUser.profile_image;

      if (req.file) {
        if (findUser.profile_image) {
          const fileName = path.basename(findUser.profile_image);
          const filePath = path.join(
            __dirname,
            "../../profile_image",
            fileName
          );
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        imageUrl = `http://localhost:9030/profileImage/${req.file.filename}`;
      }

      const updateUser = `
      UPDATE users
      SET profile_image = $1,
          updated_on = NOW()
      WHERE email = $2
      RETURNING email, first_name, last_name, profile_image
    `;
      const { rows: updatedRows } = await db.query(updateUser, [
        imageUrl,
        email,
      ]);
      const updatedUser = updatedRows[0];

      return res.status(200).json({
        status: 0,
        message: "Update Profile Image berhasil",
        data: {
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          profile_image:
            updatedUser.profile_image || "https://yoururlapi.com/profile.jpeg",
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }
}
module.exports = Controller;
