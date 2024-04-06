const express = require("express");
const { getDevices, startDevices } = require("./src/main.js");

const app = express();

app.get("/devices", async (req, res) => {
  const devices = await getDevices();

  await startDevices(["base", "base-0"]);
  res.json(devices);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});
