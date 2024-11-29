const {
  product,
  ratingProduct,
  productHistory,
  busket,
} = require("../model/base-model");

const path = require("path");
const fs = require("fs"); // Импортируем модуль fs для проверки существования файлов
const uuid = require("uuid");
const { Op, where } = require("sequelize");
const { console } = require("inspector");

class ClientService {
  async getAllProduct() {
    try {
      const productsData = await product.findAll(); // Получаем все продукты

      const productData = await Promise.all(
        productsData.map(async (product) => {
          if (!product.product_id) {
            console.error("Product ID is undefined for product:", product);
            return null; // Возвращаем null, если ID не существует
          }

          const priceData = await productHistory.findOne({
            where: { product_id: product.product_id },
          });
          const company = await ratingProduct.findOne({
            where: { product_id: product.product_id },
          });

          console.log("product.product_id: " + product.product_id);

          return {
            id: product.product_id, // Убедитесь, что id добавлен
            name: product.name,
            price: priceData ? priceData.price : null,
            rating: company ? company.rate : null,
            image: product.image, // Добавляем изображение
            description: product.description,
          };
        })
      );

      return productData.filter((item) => item !== null);
    } catch (e) {
      console.error("Ошибка получения всех продуктов:", e);
      throw e;
    }
  }

  async getImage(productId) {
    try {
      const productData = await product.findByPk(productId);
      if (!productData) {
        throw new Error("Продукт не найден");
      }

      const imagePath = productData.image; // Предполагаем, что это поле в базе данных
      const absolutePath = path.resolve(__dirname, "..", imagePath); // Получаем абсолютный путь к изображению

      // Проверяем, существует ли файл
      if (fs.existsSync(absolutePath)) {
        return absolutePath; // Возвращаем путь к изображению
      } else {
        throw new Error("Изображение не найдено");
      }
    } catch (e) {
      console.error("Ошибка получения изображения:", e);
      throw e;
    }
  }

  async addProducrBasket(Products, UserId) {
    try {
      // Ищем корзину с данным продуктом
      const dataBasket = await busket.findOne({
        where: { product_id: Products, user_id: UserId },
      });

      if (dataBasket) {
        // Если корзина с продуктом найдена, увеличиваем количество
        const countProduct = dataBasket.count;

        // Обновляем количество продукта в корзине
        await dataBasket.update({ count: countProduct + 1 });
      } else {
        // Если корзина не найдена, создаем новую запись
        const idBasket = uuid.v4();

        const newBasketEntry = await busket.create({
          basket_id: idBasket,
          user_id: UserId,
          product_id: Products,
          count: 1,
        });

        console.log("New basket entry created: ", newBasketEntry);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async getBasket(UserId) {
    try {
      const dataBasket = await busket.findAll({ where: { user_id: UserId } });

      // Используем Promise.all для получения всех продуктов и их истории
      const productsData = await Promise.all(
        dataBasket.map(async (productData) => {
          const products = await product.findOne({
            where: { product_id: productData.product_id },
          });
          const productHistoryData = await productHistory.findOne({
            where: { product_id: productData.product_id },
          });

          return {
            user_id: UserId,
            product_id: products.product_id,
            OrderedQuantity: productData.count,
            count: productHistoryData.count,
            name: products.name,
            price: productHistoryData.price,
          };
        })
      );

      // Возвращаем данные корзины
      return productsData; // Возвращаем массив объектов с данными продуктов
    } catch (e) {
      console.error(e);
      throw e; // Пробрасываем ошибку дальше
    }
  }

  async changingQuantityProduct(OrderedQuantity, productId, userId) {
    try {
      // Найти существующий товар в корзине
      const existingBasketItem = await busket.findOne({
        where: { product_id: productId, user_id: userId },
      });

      console.log("OrderedQuantity = " + OrderedQuantity);

      if (existingBasketItem) {
        // Если товар уже существует, обновляем его количество
        existingBasketItem.count = OrderedQuantity;
        await existingBasketItem.save(); // Сохраняем изменения
      } else {
        console.log("Товар не найден в корзине");
      }
    } catch (e) {
      console.error("Ошибка при изменении количества товара:", e);
      throw e; // Пробрасываем ошибку дальше
    }
  }

  async deleteBasket(productId, userId) {
    try {
      console.log(productId, userId);

      const deletedCount = await busket.destroy({
        where: { product_id: productId, user_id: userId },
      });

      if (deletedCount === 0) {
        console.log(
          "No product deleted. Product may not exist or does not belong to the user."
        );
      } else {
        console.log("Product deleted successfully.");
      }
    } catch (e) {
      console.error(e);
      throw e; // Пробрасываем ошибку дальше
    }
  }

  async OrderProducts(user_id) {
    try {
      await busket.destroy({
        where: { user_id: user_id },
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async searchProduct(dataSearch) {
    try {
      let { searchTerm, selectedCategory, priceFrom, priceTo } = dataSearch;

      // Установка значений по умолчанию
      if (priceTo === "") {
        priceTo = Number.MAX_SAFE_INTEGER;
      }
      if (priceFrom === "") {
        priceFrom = 0;
      }

      let whereClause = {};

      // Формируем условия поиска
      if (searchTerm !== "") {
        whereClause.name = searchTerm;
      }
      if (selectedCategory !== "") {
        whereClause.category = selectedCategory;
      }

      // Получаем продукты на основе условий поиска
      let products = await product.findAll({ where: whereClause });

      const filteredProducts = await Promise.all(
        products.map(async (product) => {
          const histories = await productHistory.findAll({
            where: { product_id: product.product_id },
          });

          // Убедимся, что история не пустая
          if (histories.length === 0) {
            return null; // Пропускаем продукт без истории
          }

          const history = histories[0]; // Берем первую запись истории

          // Проверка цен
          if (history.price > priceFrom && history.price < priceTo) {

            return {
              id: product.product_id, // Убедитесь, что id добавлен
              name: product.name,
              price: history.price,
              image: product.image, // Добавляем изображение
              description: product.description,
            }
          }

          return null; // Возвращаем null для непопадающих по цене
        })
      );

      // Фильтруем null значения из результата
      return filteredProducts.filter((product) => product !== null);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

module.exports = new ClientService();
