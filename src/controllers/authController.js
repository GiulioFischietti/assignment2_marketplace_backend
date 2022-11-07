var service = require('../services/authService');
const bcrypt = require('bcrypt');

const logInAsManager = async (req, res) => {
    const [user] = await service.getManagerByUsernameData(req)
    if (user.length != 0) {
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

const signUpAsManager = async (req, res) => {
    try {
        const [users] = await service.getManagerByUsernameData(req)

        if (users.length == 0) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const response = await service.createManagerData(req, hashedPassword)
            const [user] = await service.getManagerByUsernameData(req)
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
    const [user] = await service.getCustomerByUsername(req)
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
        const [users] = await service.getCustomerByUsername(req)
        if (users.length == 0) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            await service.createCustomer(req, hashedPassword)
            const [user] = await service.getCustomerByUsername(req)
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
        await service.updateCustomer(req)
        const [user] = await service.getCustomerByUsername(req)
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