const express = require("express");
const app = express();
const ngrok = require("ngrok");
const PORT = 3000;
const cors = require("cors");

app.use(cors({ origin: "*" }));

const v1 = require("./router/v1/index");
app.use("/v1", v1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Inisialisasi Ngrok saat server mulai
  try {
    const url = await ngrok.connect({
      addr: PORT, // Port lokal server Express
      authtoken: process.env.NGROK_AUTHTOKEN,
    });
    console.log(`Ngrok tunnel opened at: ${url}`);
    console.log(`You can access the server via: ${url}`);
  } catch (error) {
    console.error("Error connecting Ngrok:", error);
  }
});
