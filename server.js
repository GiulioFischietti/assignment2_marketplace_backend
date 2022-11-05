const express = require('express')
require('dotenv').config()
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { json } = require('body-parser');


var { redisClient } = require('./databases/redisDB');
var { mysqlClient } = require('./databases/mysqlDB');

const analyticsController = require('./controllers/analyticsController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const authController = require('./controllers/authController');
const cartController = require('./controllers/cartController');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.listen(3000, "0.0.0.0", ()=>console.log("Server started"));

app.post('/signupasamanager', authController.signUpAsManager)
app.post('/loginasmanager', authController.logInAsManager)

app.post('/signup', authController.signUp)
app.post('/login', authController.logIn)

app.post('/updateuser', authController.updateCustomer)

app.post('/updatestatusorder', orderController.updateStatusOrder)

app.get('/getcart', cartController.getCart)
app.post('/removefromcart', cartController.removeFromCart)
app.post('/removeallitemfromcart', cartController.removeAllItemFromCart)
app.post('/addtocart', cartController.addToCart)

app.get('/orders', orderController.getOrdersOfUser);
app.get('/orderdetails', orderController.getOrderDetails)

app.get('/managerorders', orderController.getOrdersOfManager)

app.get('/beers', productController.getBeers)
app.get('/monitors', productController.getMonitors)
app.get('/books', productController.getBooks)

app.post('/updatebook', productController.updateBook)
app.post('/updatebeer', productController.updateBeer)
app.post('/updatemonitor', productController.updateMonitor)

app.post('/createbeer', productController.createBeer)
app.post('/createbook', productController.createBook)
app.post('/createmonitor', productController.createMonitor)

app.get('/bookbyid', productController.getBookById)
app.get('/beerbyid', productController.getBeerById)
app.get('/monitorbyid', productController.getMonitorById)

app.get('/booksbybrand', productController.getBooksByBrand)
app.get('/monitorsbybrand', productController.getMonitorsByBrand)
app.get('/beersbybrand', productController.getBeersByBrand)

app.get('/productsbycategory', productController.getProductsByCategory)

app.post('/searchproducts', productController.searchProducts)

app.post('/createorder', orderController.createOrder)

app.get('/productanalytics', analyticsController.productAnalytics)
app.get('/customeranalytics', analyticsController.customerAnalytics)
app.get('/expencesanalytics', analyticsController.expencesAnalytics)