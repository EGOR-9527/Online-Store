const fs = require("fs");
const path = require("path");
const { vendorProduct, productHistory, product, ratingProduct } = require("../model/base-model");
const uuid = require("uuid");

class VendorService {
    async AddProduct(imgBuffer, name, count, price, category, description, idVendor, clientId, rate) {
        try {
            const idProduct = uuid.v4();

            // Создаем путь для сохранения изображения
            const imagePath = path.join(__dirname, "../uploads", `${idProduct}.jpg`);

            // Сохраняем изображение на сервере
            fs.writeFileSync(imagePath, imgBuffer);

            // Сохраняем информацию о продукте в базе данных
            await product.create({
                product_id: idProduct,
                name: name,
                category: category,
                description: description,
                image: imagePath, // Сохраняем путь к изображению
            });

            // Затем добавляем запись в vendor_product
            await vendorProduct.create({
                id: uuid.v4(),
                vendor_id: idVendor,
                product_id: idProduct,
            });

            // Затем добавляем историю продукта
            await productHistory.create({
                id: uuid.v4(),
                product_id: idProduct,
                price: price,
                count: count,
            });

            // Добавляем рейтинг продукта, если clientId и rate переданы
            if (clientId && rate) {
                await ratingProduct.create({
                    rate_id: uuid.v4(),
                    product_id: idProduct,
                    client_id: clientId,
                    rate: rate,
                });
            }
        } catch (e) {
            console.error("Error in AddProduct:", e);
            throw e;
        }
    }

    async GetAllVendorProducts(vendorId) {
        try {
            console.log("vendorId: ", vendorId);
        
            // Получаем все продукты продавца из базы данных
            const vendorProducts = await vendorProduct.findAll({
                where: { vendor_id: vendorId }
            });
        
            // Используем Promise.all для обработки всех асинхронных операций
            const productsData = await Promise.all(vendorProducts.map(async (vendorProduct) => {
                // Получаем данные о продукте, используя модель product
                const productsData = await product.findOne({
                    where: { product_id: vendorProduct.product_id }
                });
    
                if (!productsData) {
                    return null; // Если продукт не найден, возвращаем null
                }
    
                // Получаем последнюю историю продукта
                const lastProductHistory = await productHistory.findOne({
                    where: { product_id: vendorProduct.product_id },
                    order: [['id', 'DESC']],
                });
    
                const productDate = {
                    name: productsData.name,
                    category: productsData.category,
                    price: lastProductHistory ? lastProductHistory.price : null, // Если история не найдена, цена будет null
                    count: lastProductHistory ? lastProductHistory.count : null, // Если история не найдена, количество будет null
                }
        
                console.log(productDate);
                return productDate; // Возвращаем данные о продукте
            }));
        
            // Удаляем все null значения из массива
            return productsData.filter(product => product !== null); // Возвращаем массив данных о продуктах
        
        } catch (e) {
            console.error('Error in GetAllVendorProducts:', e);
            throw e;
        }
    }
}

module.exports = new VendorService();