const {client, admin, vendor} = require("../model/base-model");
const TokenService = require("../service/token-service");

const uuid = require("uuid");
const bcrypt = require("bcrypt");

class UserService {

    async registration(name, surname, email, password, status, company) {

        try {

            console.log(name, surname, email, password, status, company);

            if (status === "client") {
                const user = await client.findOne({where: {email: email}});

                if (user !== null) {
                    throw new Error("Email already taken or invalid");
                  }

                const userId = uuid.v4();
                const hashedPassword = await bcrypt.hash(password, 10);
                const token = TokenService.generateToken({name, email, password, status});

                await client.create({
                    client_id: userId,
                    name: name,
                    surname: surname,
                    email: email,
                    hash_password: hashedPassword,
                    refresh_token: token.refreshToken,
                });

                return {token, userId};

            } else if (status === "vendor") {
                const user = await vendor.findOne({where: {email: email}});

                if (!company) {
                    throw new Error("Company is required for vendor registration");
                }

                console.log("user", user);
                if (user !== null) {
                    throw new Error("User with this email already exists");
                }

                const userId = uuid.v4();
                const hashedPassword = await bcrypt.hash(password, 10);
                const token = TokenService.generateToken({name, email, password, status});

                await vendor.create({
                    vendor_id: userId,
                    name_vendor: name,
                    surname_vendor: surname,
                    company:company,
                    email: email,
                    hash_password: hashedPassword,
                    refresh_token: token.refreshToken,
                });

                console.log("token", token);

                return {token, userId};

            } else if (status === "admin") {
                const user = await admin.findOne({where: {email: email}});

                if (user !== null) {
                    throw new Error("User with this email already exists");
                }

                const userId = uuid.v4();
                const hashedPassword = await bcrypt.hash(password, 10);
                const token = TokenService.generateToken({name, email, password, status});

                await admin.create({
                    id: userId,
                    name: name,
                    surname: surname,
                    email: email,
                    hash_password: hashedPassword,
                    refresh_token: token.refreshToken,
                });

                return {token, userId};

            }

        } catch (err) {
            console.error(err);
        }

    }

    async login(name, email, password, status) {
        try {

            if (status === "client") {

                console.log("login: ", name, email, password)

                const user = await client.findOne({where: {email: email}});

                if (!user) {
                    throw new Error("User not found");
                }

                const token = TokenService.generateToken({name, email, password, status});

                if (!bcrypt.compareSync(password, user.hash_password)) {
                    throw new Error("Invalid password");
                }

                await TokenService.saveToken(email, token.refreshToken, status);

                console.log(token, user.client_id)

                return {token, userId: user.client_id};

            } else if (status === "vendor") {

                const user = await vendor.findOne({where: {email: email}});

                if (!user) {
                    throw new Error("User not found");
                }

                const token = TokenService.generateToken({name, email, password, status});

                if (!bcrypt.compareSync(password, user.hash_password)) {
                    throw new Error("Invalid password");
                }

                await TokenService.saveToken(email, token.refreshToken, status);

                return {token, userId: user.vendor_id};

            } else if (status === "admin") {

                const user = await admin.findOne({where: {email: email}});

                if (!user) {
                    throw new Error("User not found");
                }

                const token = TokenService.generateToken({name, email, password, status});

                if (!bcrypt.compareSync(password, user.hash_password)) {
                    throw new Error("Invalid password");
                }

                await TokenService.saveToken(email, token.refreshToken, status);

                return {token, userId: user.id};

            }

        } catch (err) {
            console.error(err);
        }
    }

}

module.exports = new UserService();