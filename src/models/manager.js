const { mysqlClient } = require("../config/mysqlDB");
const { User } = require("./user");

class Manager extends User {
    constructor(data) {
        super(data);
        this.id = data.id;
        this.user_id = data.user_id;
        this.title = data.title;
        this.hired_date = data.hired_date;
    }


    static getManagerByUsernameData = async (req) => {
        try {
            const [response] = await mysqlClient.query("select * from user INNER join manager on user.id = manager.user_id where user.username = '$username';".replace("$username", req.body.username))
            return response.map((item) => new Manager(item));
        } catch (error) {
            console.log(error)
        }
    }



    static createManagerData = async (req, hashedPassword) => {
        try {
            const newUser = await mysqlClient.query("INSERT INTO user (name, username, password) values ('" + req.body.name + "', '" + req.body.username + "', '" + hashedPassword + "');")
            const newManager = await mysqlClient.query("INSERT INTO manager (user_id) values ('" + newUser[0].insertId + "');")
            return newManager
        } catch (error) {
            console.log(error)
        }

    }

}

module.exports = {
    Manager
}