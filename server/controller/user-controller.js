const UserService = require("../service/user-service");

class UserController {
  async registration(req, res, next) {
    try {
      const { name, surname, email, password, status, company } = req.body;
      console.log(name, surname, email, password, status, company);

      const user = await UserService.registration(
        name,
        surname,
        email,
        password,
        status,
        company
      ); // Pass company parameter

      req.session.refreshToken = user.refreshToken;

      console.log(user);
      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { name, email, password, status } = req.body;

      const user = await UserService.login(name, email, password, status);

      req.session.refreshToken = user.token.refreshToken;

      console.log("login : " + req.session.refreshToken);

      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Ошибка при выходе" });
        }
        return res.json({ success: true });
      });

      console.log(req.session);

      return res.json({ success: true });
    } catch (e) {
      console.error("Logout error: ", e);
      next(e);
    }
  }
}

module.exports = new UserController();
