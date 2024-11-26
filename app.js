const express = require("express");
const app = express();
const PORT = 3000;
const cors = require("cors");

app.use(cors({ origin: "*" }));

const v1 = require("./router/v1/index");
app.use("/v1", v1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
