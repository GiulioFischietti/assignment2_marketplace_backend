const bcrypt = require('bcrypt');
const { Customer } = require('../models/customer');
const { Manager } = require('../models/manager');

const logInAsManager = async (req, res) => {
    const managers = await Manager.getManagerByUsernameData(req)
    if (managers.length != 0) {
        try {
            if (await bcrypt.compare(req.body.password, managers[0].password))
                res.send({ "success": true, data: managers[0] })
            else res.status(403).send({ "success": false, data: "Wrong username/password" })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }

}

const signUpAsManager = async (req, res) => {
    try {
        const [users] = await Manager.getManagerByUsernameData(req)

        if (users.length == 0) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const response = await Manager.createManagerData(req, hashedPassword)
            const [user] = await Manager.getManagerByUsernameData(req)
            res.status(200).send({ success: true, data: user[0] });
        }
        else {
            console.log("Manager already registered")
            res.status(500).send({ success: false, data: "Username already registered" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, data: error })
    }
}

const logIn = async (req, res) => {
    const user = await Customer.getCustomerByUsername(req)
    if (user != []) {
        try {
            if (await bcrypt.compare(req.body.password, user[0].password))
                res.send({ "success": true, data: user[0] })
            else res.status(403).send({ "success": false, data: "Wrong username/password" })
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    }
    else {
        res.status(403).send({ success: false, data: "User not registered" });
    }
}

const signUp = async (req, res) => {
    try {
        const users = await Customer.getCustomerByUsername(req)
        if (users.length == 0) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            await Customer.createCustomer(req, hashedPassword)
            const [user] = await Customer.getCustomerByUsername(req)
            res.status(200).send({ success: true, data: user[0] });
        }
        else {
            res.status(200).send({ success: false, data: "Username already registered" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, data: error })
    }
}

const updateCustomer = async (req, res) => {
    try {
        await Customer.updateCustomer(req)
        const [user] = await Customer.getCustomerByUsername(req)
        res.send({ "success": true, data: user[0] })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
}
module.exports = {
    signUpAsManager,
    logIn,
    signUp,
    updateCustomer,
    logInAsManager,

}