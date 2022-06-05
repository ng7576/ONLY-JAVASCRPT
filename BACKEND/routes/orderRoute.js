const express = require("express");
const { newOrder, getSingleOrder, myOrder, allOrder, updateOrder, deleteOrder } = require("../controller/orderController");
const { getAllProducts } = require("../controller/productController");
const { isAuthenticatedUser, authorizedRoles } = require("../MIDDLEWARE/auth");
const router = express.Router();
router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrder);
router.route("/admin/orders").get(isAuthenticatedUser, authorizedRoles("admin"),allOrder);
router.route("/admin/order/:id")
.put(isAuthenticatedUser, authorizedRoles("admin"), updateOrder);

router.route("/admin/order/:id").delete(isAuthenticatedUser, authorizedRoles("admin", deleteOrder));

module.exports = router;