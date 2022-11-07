const express = require('express')
require('dotenv').config()
const app = express();

const productRouter = require('./routes/productRoutes')
const orderRouter = require('./routes/orderRoutes')
const analyticsRouter = require('./routes/analyticsRoutes')
const authRouter = require('./routes/authRoutes')
const cartRouter = require('./routes/cartRoutes')

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.listen(3000, "0.0.0.0", () => console.log("Server started"));



app.use("/auth", authRouter)
app.use("/cart", cartRouter)
app.use("/product", productRouter)
app.use("/analytics", analyticsRouter)
app.use("/order", orderRouter)

