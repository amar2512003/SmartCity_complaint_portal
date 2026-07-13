const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectdb = require("./config/db");
const complaintRoutes = require("./routes/complaintRoutes");
const userroutes = require("./routes/userroutes");
const orderroutes = require("./routes/orderRoutes");
const paymentroutes = require("./routes/paymentRoutes");
const chatboatroutes = require("./routes/chatboatroutes");
const aiRoutes = require("./routes/aiRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
dotenv.config();
const app = express();
connectdb();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  }),
);
app.use(express.json());

//static folder access
app.use("/uploads", express.static("uploads"));

app.use("/api/complaints", complaintRoutes);
app.use("/api/auth", userroutes);
app.use("/api/orders", orderroutes);
app.use("/api/payment", paymentroutes);
app.use("/api/chatbot", chatboatroutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Smart City Complaint API is working");
});
const port = process.env.PORT || process.env.port || 5500;

app.listen(port, () => {
  console.log(`server is running port ${port}`);
});
