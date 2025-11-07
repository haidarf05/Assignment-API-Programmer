const BalanceCollection = require("../models/balance.js");
const ServicesCollection = require("../models/services.js");
const TransactionCollection = require("../models/transaction.js");
const momentTz = require("moment-timezone");
const db = require("../../config/db.connect");

class Controller {
  static async balance(req, res, next) {
    try {
      const { email } = req.decoded;
      const getBalance = "SELECT balance FROM balances WHERE email = $1";
      const { rows } = await db.query(getBalance, [email]);

      let balance = rows[0].balance;

      return res.status(200).json({
        status: 0,
        message: "Get Balance Berhasil",
        data: { balance: getBalance?.balance || 0 },
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  static async topup(req, res, next) {
    try {
      const { top_up_amount } = req.body || {};
      const { email } = req.decoded;
      const newTopup = Number(top_up_amount);

      let date = momentTz
        .tz(new Date(), "Asia/Jakarta")
        .format("DDMMYYYY-HHmmss");
      let invoice = `INV${date}`;

      if (!top_up_amount) {
        return res.status(400).json({
          status: 102,
          message: "Silahkan isi nominal topup",
          data: null,
        });
      }

      if (isNaN(newTopup) || newTopup < 0) {
        return res.status(400).json({
          status: 102,
          message:
            "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
          data: null,
        });
      }

      const getBalance = `
      SELECT balance 
      FROM balances 
      WHERE email = $1
    `;
      const { rows } = await db.query(getBalance, [email]);

      let valueBalance;

      if (rows.length === 0) {
        let insertBalance = `
        INSERT INTO balances (email, balance, created_on, updated_on)
        VALUES ($1, $2, NOW(), NOW())
        RETURNING balance
      `;
        const { rows: inserted } = await db.query(insertBalance, [
          email,
          newTopup,
        ]);
        valueBalance = inserted[0].balance;
      } else {
        let updateBalance = `
        UPDATE balances
        SET balance = balance + $1,
            updated_on = NOW()
        WHERE email = $2
        RETURNING balance
      `;
        const { rows: updated } = await db.query(updateBalance, [
          newTopup,
          email,
        ]);
        valueBalance = updated[0]?.balance;
      }

      const insertTrasaction = `
      INSERT INTO transactions (email, invoice_number, transaction_type, description, total_amount, created_on, updated_on)
      VALUES ($1, $2, 'TOPUP', 'Top Up Balance', $3, NOW(), NOW())
    `;
      await db.query(insertTrasaction, [email, invoice, newTopup]);

      return res.status(200).json({
        status: 0,
        message: "Top Up Balance berhasil",
        data: { balance: Number(valueBalance) || 0 },
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  static async transaction(req, res, next) {
    try {
      const { service_code } = req.body || {};
      const { email } = req.decoded;
      let date = momentTz
        .tz(new Date(), "Asia/Jakarta")
        .format("DDMMYYYY-HHmmss");
      let invoice = `INV${date}`;
      if (!service_code) {
        return res.status(400).json({
          status: 102,
          message: "Silahkan pilih kode service",
          data: null,
        });
      }

      const findServices = `
      SELECT service_code, service_name, service_tariff
      FROM services
      WHERE service_code = $1
    `;

      const { rows: serviceRows } = await db.query(findServices, [
        service_code,
      ]);

      if (serviceRows.length === 0) {
        return res.status(400).json({
          status: 102,
          message: "Service atau Layanan tidak ditemukan",
          data: null,
        });
      }
      const service = serviceRows[0];

      const getBalance = `
      SELECT balance
      FROM balances
      WHERE email = $1
    `;
      const { rows: balanceRows } = await db.query(getBalance, [email]);
      const userBalance = balanceRows[0]?.balance || 0;

      if (Number(userBalance) < Number(service.service_tariff)) {
        return res.status(400).json({
          status: 102,
          message: "Saldo anda tidak mencukupi",
          data: null,
        });
      }

      const updateBalance = `
      UPDATE balances
      SET balance = balance - $1,
          updated_on = NOW()
      WHERE email = $2
      RETURNING balance
    `;
      await db.query(updateBalance, [service.service_tariff, email]);

      const insertTransaction = `
      INSERT INTO transactions
      (email, invoice_number, transaction_type, description, total_amount, created_on, updated_on)
      VALUES ($1, $2, 'PAYMENT', $3, $4, NOW(), NOW())
    `;
      await db.query(insertTransaction, [
        email,
        invoice,
        service.service_name,
        service.service_tariff,
      ]);
      return res.status(200).json({
        status: 0,
        message: "Transaksi berhasil",
        data: {
          invoice_number: invoice,
          service_code: service.service_code,
          service_name: service.service_name,
          transaction_type: "PAYMENT",
          total_amount: Number(service.service_tariff),
          created_on: new Date(),
          updated_on: new Date(),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }

  static async history(req, res, next) {
    try {
      const { offset, limit } = req.query;
      let newOffset = Number(offset) || 0;
      let newLimit = Number(limit) || 0;
      const { email } = req.decoded;

      let getTransaction;
      let params;
      if (!newLimit) {
        getTransaction = `
      SELECT invoice_number, transaction_type, description, total_amount, created_on, updated_on
      FROM transactions
      WHERE email = $1
      ORDER BY created_on DESC
      OFFSET $2 
    `;
        params = [email, newOffset];
      } else {
        getTransaction = `
      SELECT invoice_number, transaction_type, description, total_amount, created_on, updated_on
      FROM transactions
      WHERE email = $1
      ORDER BY created_on DESC
      OFFSET $2 LIMIT $3
    `;

        params = [email, newOffset, newLimit];
      }
      const { rows: transactionRows } = await db.query(getTransaction, params);

      if (!transactionRows || transactionRows.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Tidak ada transaksi ditemukan",
        });
      }

      res.status(200).json({
        status: 0,
        message: "Get History Berhasil",
        data: {
          offset: newOffset,
          limit: newLimit,
          records: transactionRows.map((data) => ({
            invoice_number: data.invoice_number,
            transaction_type: data.transaction_type,
            description: data.description,
            total_amount: data.total_amount,
            created_on: data.created_on,
            updated_on: data.updated_on || "-",
          })),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  }
}

module.exports = Controller;
