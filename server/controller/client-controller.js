const ClientService = require("../service/client-service");

class ClientController {
  async getAllProduct(req, res, next) {
    try {
      const productData = await ClientService.getAllProduct();
      console.log("productData: ", productData);

      console.log("productData: ", productData);
      res.json(productData); // Отправляем данные клиенту
    } catch (e) {
      next(e);
    }
  }

  async getImage(req, res, next) {
    try {
      const { id } = req.params;

      console.log("imagePath: " + id);
      const imagePath = await ClientService.getImage(id); // Получаем путь к изображению

      res.sendFile(imagePath); // Отправляем изображение клиенту
    } catch (e) {
      next(e); // Обработка ошибок
    }
  }

  async addProducrBasket(req, res, next) {
    try {
      const { Products, UserId } = req.body;

      await ClientService.addProducrBasket(Products, UserId);
    } catch (e) {
      next(e);
    }
  }

  async getBasket(req, res, next) {
    try {
      // Извлекаем UserId из параметров URL
      const { userId } = req.body; // Измените это на req.params.userId

      // Убедитесь, что userId не равен undefined
      if (!userId) {
        return res.status(400).json({ error: "User  ID is required" });
      }

      const dataBasket = await ClientService.getBasket(userId);

      console.log("dataBasket: ", dataBasket);
      // Отправляем данные корзины обратно клиенту
      res.json(dataBasket);
    } catch (e) {
      next(e);
    }
  }

  // Ваша функция контроллера
  async changingQuantityProduct(req, res, next) {
    try {
      const { OrderedQuantity, productId, userId } = req.body;

      // Убедитесь, что параметры переданы
      if (!OrderedQuantity || !productId || !userId) {
        return res.status(400).json({ message: "Недостаточно данных" });
      }

      await ClientService.changingQuantityProduct(
        OrderedQuantity,
        productId,
        userId
      );

      // Отправляем успешный ответ
      return res.status(200).json({ message: "Количество товара обновлено" });
    } catch (e) {
      next(e); // Передаем ошибку в следующий middleware
    }
  }

  async deleteProductBasket(req, res, next) {
    try {
      const { product_id, user_id } = req.body;
      await ClientService.deleteBasket(product_id, user_id);
    } catch (e) {
      next(e);
    }
  }

  async OrderProducts(req, res, next) {
    try {
      const { user_id } = req.body;

      console.log("user_id: ", user_id);

      await ClientService.OrderProducts(user_id);
    } catch (e) {
      next(e);
    }
  }

  async searchProduct(req, res, next) {
    try {
      const { dataSearch } = req.body;
      const searchResults = await ClientService.searchProduct(dataSearch); // Обработка результата поиска
      
      console.log("searchProduct: ", searchResults);
      res.json(searchResults);
    
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ClientController();
