const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const {verifyToken, checkAdmin} = require('../middleware/auth');

// ============ PACKAGES (User) ============
router.get('/packages', premiumController.getAllPackages);
router.get('/packages/:packageId', premiumController.getPackageById);
router.get('/status', verifyToken, premiumController.getUserPremiumStatus);

// ============ PACKAGES (Admin) ============
router.get('/admin/packages', verifyToken, checkAdmin, premiumController.getAllPackagesForAdmin);
router.post('/admin/packages', verifyToken, checkAdmin, premiumController.createPackage);
router.put('/admin/packages/:packageId', verifyToken, checkAdmin, premiumController.updatePackage);
router.delete('/admin/packages/:packageId', verifyToken, checkAdmin, premiumController.deletePackage);

// ============ BENEFITS (Admin) ============
// Lấy danh sách quyền lợi có thể sử dụng
router.get('/admin/benefits', verifyToken, checkAdmin, premiumController.getAvailableBenefits);
// Thêm quyền lợi mới
router.post('/admin/benefits', verifyToken, checkAdmin, premiumController.addBenefit);
// Cập nhật quyền lợi (bật/tắt, sửa tên)
router.put('/admin/benefits/:benefitId', verifyToken, checkAdmin, premiumController.updateBenefit);
// Xóa quyền lợi
router.delete('/admin/benefits/:benefitId', verifyToken, checkAdmin, premiumController.deleteBenefit);

module.exports = router;