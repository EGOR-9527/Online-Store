const { DataTypes } = require("sequelize");
const sequelize = require("../db");

//база покупателя
const client = sequelize.define("client", {
  client_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  hash_password: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

//база корзины
const busket = sequelize.define("busket", {
  basket_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: client,
      key: "client_id",
    },
    allowNull: false,
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

//база продукта
const product = sequelize.define("product", {
  product_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

//тут хронится цена и количество товаров
const productHistory = sequelize.define("productHistory", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: product,
      key: "product_id",
    },
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

//база рэйтинга
const ratingProduct = sequelize.define("ratingProduct", {
  rate_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  client_id: {
    type: DataTypes.UUID,
    references: {
      model: client,
      key: "client_id",
    },
    allowNull: false,
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: product,
      key: "product_id",
    },
    allowNull: false,
  },
  rate: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

//база продовцов
const vendor = sequelize.define("vendor", {
  vendor_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  name_vendor: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  surname_vendor: {
    type: DataTypes.STRING(50), // Добавляем столбец surname_vendor
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING(100), // Добавляем столбец company
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  hash_password: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

//база продуктов продовца
const vendorProduct = sequelize.define("vendor_product", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  vendor_id: {
    type: DataTypes.UUID,
    references: {
      model: vendor,
      key: "vendor_id",
    },
    allowNull: false,
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: product,
      key: "product_id",
    },
    allowNull: false,
  },
});


// Синхронизация моделей с базой данных
sequelize
  .sync({ force: false }) // force: false чтобы не удалять существующие таблицы
  .then(() => {
    console.log("Модели синхронизированы с базой данных");
  })
  .catch((error) => {
    console.error("Ошибка при синхронизации моделей:", error);
  });

// Exporting models
module.exports = {
  client,
  busket,
  product,
  productHistory,
  ratingProduct,
  vendor,
  vendorProduct,
};
