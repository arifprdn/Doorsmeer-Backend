const router = require("express").Router();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const authenticateToken = require("../../middleware/authMiddleware");
const midtransClient = require("midtrans-client");
const axios = require("axios");
const crypto = require("crypto");

router.use(express.json());

////////////////////////////////////////                   ENDPOINT NON LOGIN                   ////////////////////////////////////////
router.get("/", (req, res) => {
  res.json({
    status: true,
    message: "welcome to doorsmeer api",
    data: null,
  });
});

router.post("/getantrian", async (req, res) => {
  try {
    // Ambil data antrian dan urutkan berdasarkan ID
    const antrian = await prisma.antrian.findMany({
      orderBy: {
        id: "asc", // Urutkan berdasarkan kolom `id` secara ascending
      },
    });

    res.status(200).json({
      success: true,
      message: "Daftar antrian berhasil diambil.",
      data: antrian,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data antrian.",
      error: error.message,
    });
  }
});

router.post("/getantrian/today", async (req, res) => {
  try {
    // Ambil tanggal hari ini (mulai dari jam 00:00:00 hingga 23:59:59)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Query data antrian berdasarkan waktu hari ini
    const antrianHariIni = await prisma.antrian.findMany({
      where: {
        createdAt: {
          gte: startOfDay, // Greater than or equal to start of the day
          lte: endOfDay, // Less than or equal to end of the day
        },
      },
      orderBy: {
        createdAt: "asc", // Urutkan berdasarkan waktu pembuatan
      },
    });

    // Kirim response
    res.status(200).json({
      success: true,
      message: "Daftar antrian untuk hari ini berhasil diambil",
      data: antrianHariIni,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data antrian",
      error: error.message,
    });
  }
});

router.post("/status", async (req, res) => {
  try {
    const websiteStatus = await prisma.doorsmeerStatus.findUnique({
      where: { id: 1 },
    });

    if (!websiteStatus) {
      return res.status(404).json({
        success: false,
        message: "Status website belum diatur.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status website berhasil diambil.",
      data: websiteStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil status website.",
      error: error.message,
    });
  }
});

router.post("/getjasa", async (req, res) => {
  try {
    // Ambil semua data jasa
    const allJasa = await prisma.jasa.findMany({
      orderBy: {
        createdAt: "asc", // Urutkan berdasarkan waktu pembuatan (opsional)
      },
    });

    res.status(200).json({
      success: true,
      message: "Daftar jasa berhasil diambil.",
      data: allJasa,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil daftar jasa.",
      error: error.message,
    });
  }
});

router.post("/create-payment", async (req, res) => {
  const {
    jasaId,
    customerName,
    customerEmail,
    customerPhone,
    namaKendaraan,
    nomorPolisi,
  } = req.body;

  // Validasi input
  if (
    !jasaId ||
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !namaKendaraan ||
    !nomorPolisi
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Data yang diperlukan: jasaId, customerName, customerEmail, customerPhone.",
    });
  }

  try {
    const jasa = await prisma.jasa.findUnique({
      where: { id: jasaId },
    });

    if (!jasa) {
      return res.status(404).json({
        success: false,
        message: "Jasa tidak ditemukan.",
      });
    }

    const payload = {
      transaction_details: {
        order_id: `${namaKendaraan}-${nomorPolisi}-${jasa.id.toString()}-${Date.now()}`, // Buat order_id unik
        gross_amount: jasa.harga, // Harga dari jasa
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      item_details: [
        {
          id: jasa.id.toString(),
          price: jasa.harga,
          quantity: 1,
          name: jasa.namaJasa,
        },
      ],
    };

    //console.log("MIDTRANS :>> ", process.env.MIDTRANS_SERVER_KEY);
    const authString = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);
    //console.log("authString :>> ", authString);

    const response = await fetch(
      `https://app.sandbox.midtrans.com/snap/v1/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    res.status(201).json({
      status: "true",
      message: "success",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat SNAP_TOKEN.",
      error: error.response ? error.response.data : error.message,
    });
  }
});

///////////////////////////////////                   ENDPOINT JARANG DIGUNAKAN                   ///////////////////////////////////

router.post("/users", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  console.log(req.body);

  // Validasi input
  if (!username || !password) {
    return res.status(400).json({
      status: false,
      message: "Username and password are required",
    });
  }

  try {
    // Cek apakah username sudah ada
    const existingUser = await prisma.admin.findFirst({
      where: { username: username },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ status: false, message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna baru ke database
    const newUser = await prisma.admin.create({
      data: {
        username: username,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: {
        user_id: newUser.user_id,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occurred while creating the user",
    });
  }
});

router.post("/webhook", async (req, res) => {
  const data = req.body;

  try {
    if (!data) {
      res.status(400).json({
        status: "error",
        message: "field dibutuhkan!",
        data: null,
      });
    }
    const hash = crypto
      .createHash("sha512")
      .update(
        `${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
      )
      .digest("hex");
    if (data.signature_key !== hash) {
      return {
        status: "error",
        message: "invalid signature key!",
      };
    }

    const orderString = data.order_id.toString();

    // Pisahkan string menggunakan "-"
    const parts = orderString.split("-");
    const namaKendaraan = parts[0];
    const nomorPolisi = parts[1];
    const jasaId = parts[2];

    if (data.transaction_status == "capture") {
      if (data.fraud_status == "accept") {
        const transaksi = await prisma.transaksi.create({
          data: {
            payment_type: "Midtrans",
            total_price: parseFloat(data.gross_amount),
            jasaId: Number(jasaId),
          },
        });

        // Buat antrian
        const antrian = await prisma.antrian.create({
          data: {
            namaKendaraan,
            nomorPolisi,
            transaksiId: transaksi.payment_id,
            EditedBy: "User",
          },
          include: {
            transaksi: {
              include: {
                jasa: true, // Ambil data jasa yang terkait
              },
            },
          },
        });
      }
    } else if (data.transaction_status == "settlement") {
      const transaksi = await prisma.transaksi.create({
        data: {
          payment_type: "Midtrans",
          total_price: parseFloat(data.gross_amount),
          jasaId: Number(jasaId),
        },
      });

      // Buat antrian
      const antrian = await prisma.antrian.create({
        data: {
          namaKendaraan,
          nomorPolisi,
          transaksiId: transaksi.payment_id,
          EditedBy: "User",
        },
        include: {
          transaksi: {
            include: {
              jasa: true, // Ambil data jasa yang terkait
            },
          },
        },
      });
    }

    res.status(200).json({
      status: true,
      message: "success",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan !",
      error: error.message,
    });
  }
});

// DEBUG ONLY //
// const hash = crypto
//   .createHash("sha512")
//   .update(
//     `AVANZA-BK2040FF-2-169134983000020010000.00${process.env.MIDTRANS_SERVER_KEY}`
//   )
//   .digest("hex");
// console.log("hash :>> ", hash);

////////////////////////////////////////                   ENDPOINT ADMIN                   ////////////////////////////////////////

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validasi input
  if (!username || !password) {
    return res
      .status(400)
      .json({ status: false, message: "Username and password are required" });
  }

  try {
    // Cari pengguna di database berdasarkan username
    const user = await prisma.admin.findFirst({
      where: {
        username: username,
      },
    });

    // Cek apakah user ditemukan
    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid username or password" });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid username or password" });
    }

    // Buat token JWT
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      status: true,
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, message: "An error occurred during login" });
  }
});

router.post("/admin/addantrian", authenticateToken, async (req, res) => {
  const { namaKendaraan, nomorPolisi, jasaId } = req.body;

  // Validasi input
  if (!namaKendaraan || !nomorPolisi || !jasaId) {
    return res.status(400).json({
      success: false,
      message: "Data yang diperlukan: namaKendaraan, nomorPolisi, jasaId.",
    });
  }

  try {
    // Ambil detail jasa berdasarkan ID
    const jasa = await prisma.jasa.findUnique({
      where: { id: jasaId },
    });

    if (!jasa) {
      return res.status(404).json({
        success: false,
        message: "Jasa tidak ditemukan.",
      });
    }

    // Buat transaksi
    const transaksi = await prisma.transaksi.create({
      data: {
        total_price: jasa.harga,
        jasaId: jasa.id,
      },
    });

    // Buat antrian
    const antrian = await prisma.antrian.create({
      data: {
        namaKendaraan,
        nomorPolisi,
        transaksiId: transaksi.payment_id,
        EditedBy: "Admin",
      },
      include: {
        transaksi: {
          include: {
            jasa: true, // Ambil data jasa yang terkait
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Antrian berhasil ditambahkan.",
      data: antrian,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan antrian.",
      error: error.message,
    });
  }
});

router.post("/admin/editantrian/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const antrian = await prisma.antrian.update({
    where: { id: Number(id) },
    data: { status },
  });

  res.json(antrian);
});

router.post("/admin/deleteantrian/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  await prisma.antrian.delete({
    where: { id: Number(id) },
  });

  res.json({ message: "Antrian dihapus" });
});

router.post("/admin/status", authenticateToken, async (req, res) => {
  const { isOpen } = req.body;

  if (typeof isOpen !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Parameter 'isOpen' harus berupa boolean (true/false).",
    });
  }

  try {
    // Perbarui atau buat status website
    const websiteStatus = await prisma.doorsmeerStatus.upsert({
      where: { id: 1 },
      update: { isOpen },
      create: { isOpen },
    });

    res.status(200).json({
      success: true,
      message: `Website Antrian telah ${isOpen ? "dibuka" : "ditutup"}.`,
      data: websiteStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengatur status website.",
      error: error.message,
    });
  }
});

router.post("/admin/addjasa", authenticateToken, async (req, res) => {
  const { namaJasa, harga } = req.body;

  // Validasi input
  if (!namaJasa || typeof harga !== "number" || harga <= 0) {
    return res.status(400).json({
      success: false,
      message: "Nama jasa dan harga yang valid diperlukan.",
    });
  }

  try {
    // Tambahkan data ke database
    const newJasa = await prisma.jasa.create({
      data: {
        namaJasa,
        harga,
      },
    });

    res.status(201).json({
      success: true,
      message: "Jasa berhasil ditambahkan.",
      data: newJasa,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan jasa.",
      error: error.message,
    });
  }
});

router.post("/admin/editjasa/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { namaJasa, harga } = req.body;

  // Validasi input
  if (!namaJasa && typeof harga !== "number") {
    return res.status(400).json({
      success: false,
      message: "Nama jasa atau harga yang valid diperlukan untuk diperbarui.",
    });
  }

  try {
    // Update jasa di database
    const updatedJasa = await prisma.jasa.update({
      where: {
        id: Number(id),
      },
      data: {
        ...(namaJasa && { namaJasa }),
        ...(typeof harga === "number" && harga > 0 && { harga }),
      },
    });

    res.status(200).json({
      success: true,
      message: "Jasa berhasil diperbarui.",
      data: updatedJasa,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui jasa.",
      error: error.message,
    });
  }
});

router.post("/admin/deletejasa/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Hapus jasa dari database
    await prisma.jasa.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Jasa berhasil dihapus.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus jasa.",
      error: error.message,
    });
  }
});

module.exports = router;
