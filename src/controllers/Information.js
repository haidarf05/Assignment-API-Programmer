const BannersCollection = require("../models/banner");
const ServicesCollection = require("../models/services");
const db = require("../../config/db.connect");

class Controller {
  static async banner(req, res, next) {
    try {
      const findBanner = "SELECT * FROM banners";
      const { rows } = await db.query(findBanner);
      if (!rows || rows.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Tidak ada banner ditemukan",
        });
      }
      return res.status(200).json({
        status: 0,
        message: "Sukses",
        data: rows.map((data) => ({
          banner_name: data.banner_name,
          banner_image: data.banner_image,
          description: data.description,
        })),
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  static async services(req, res, next) {
    try {
      const findServices = "SELECT * FROM services";
      const { rows } = await db.query(findServices);

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Tidak ada services ditemukan",
        });
      }

      return res.status(200).json({
        status: 0,
        message: "Sukses",
        data: rows.map((data) => ({
          service_code: data.service_code,
          service_name: data.service_name,
          service_icon: data.service_icon,
          service_tariff: Number(data.service_tariff),
        })),
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }
}
module.exports = Controller;
