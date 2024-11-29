const VendorService = require('../service/vendor-service');

class VendorController {
    async AddProduct(req, res, next) {
        try {
            const imgBuffer = req.file.buffer; 
            const { name, price, quantity, category, description, idVendor, clientId, rate } = req.body;
    
            // Проверяем, что idVendor не undefined
            if (!idVendor) {
                return res.status(400).json({ error: 'idVendor is required' });
            }
    
            // Вызов сервиса для добавления продукта
            const data = await VendorService.AddProduct(imgBuffer, name, quantity, price, category, description, idVendor, clientId, rate);
    
            // Отправляем ответ клиенту
            res.status(201).json({ message: 'Product added successfully', data });
        } catch (e) {
            console.error('Error in AddProduct:', e);
            next(e);
        }
    }

    async GetAllVendorProducts(req, res, next) {
        try {
            const userId = req.query.userId; // Получаем userId из параметров запроса

            console.log("userId", userId); // Лог для проверки
    
            const productData = await VendorService.GetAllVendorProducts(userId); // Передаем vendorId в сервис
            res.status(200).json(productData);
        } catch (e) {
            console.error('Error in GetAllVendorProducts:', e);
            next(e);
        }
    }
}

module.exports = new VendorController();