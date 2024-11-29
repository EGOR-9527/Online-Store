const { Router } = require("express");
const userController = require("../controller/user-controller");
const VendorController = require("../controller/vendor-controller");
const ClientController = require("../controller/client-controller");
const authMiddleware = require('../middleware/auth-middleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get('/refresh'); // Вы можете добавить обработчик для этого маршрута

router.post('/login', userController.login);
router.post('/registration', userController.registration);
router.post('/addProduct/:id',authMiddleware, upload.single('img'), VendorController.AddProduct);
router.post('/addProducrBasket/:id',authMiddleware, ClientController.addProducrBasket);
router.post('/getBasket/:id',authMiddleware, ClientController.getBasket);
router.post('/changingQuantityProduct/:id',authMiddleware, ClientController.changingQuantityProduct);
router.post('/deleteProductBasket/:id',authMiddleware, ClientController.deleteProductBasket);
router.post('/OrderProducts/:id',authMiddleware, ClientController.OrderProducts);
router.post('/searchProduct/:id',authMiddleware, ClientController.searchProduct);

router.get('/GetAllVendorProducts/:id',authMiddleware, VendorController.GetAllVendorProducts); // Исправлено на GetAllProducts
router.get('/getImage/:id',authMiddleware, ClientController.getImage);
router.get('/getAllProduct/:id',authMiddleware, ClientController.getAllProduct);

module.exports = router;