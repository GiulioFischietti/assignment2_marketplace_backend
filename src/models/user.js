class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.username = data.username;
        this.password = data.password;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.image_url = data.image_url;
    }
}

module.exports = {
    User
}