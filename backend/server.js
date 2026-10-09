require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const app = require('./src/app');
const cronRoutes = require("./routes/cronRoutes");

const PORT = process.env.PORT || 3000;

app.use("api/cron", cronRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

