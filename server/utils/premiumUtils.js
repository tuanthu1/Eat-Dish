const User = require('../models/UserModel');
const PremiumPackage = require('../models/PremiumPackage');
const SiteSetting = require('../models/SiteSetting');

/**
 * Kiểm tra xem user có quyền lợi cụ thể không
 * @param {string} userId - ID của user
 * @param {string} benefitId - ID của quyền lợi cần kiểm tra
 * @returns {Promise<boolean>}
 */
async function userHasBenefit(userId, benefitId) {
    try {
        // Lấy thông tin user
        const user = await User.findById(userId).select('is_premium premium_until premium_package_id');
        
        // User phải là VIP và còn hạn
        if (!user?.is_premium) return false;
        
        const now = new Date();
        if (user.premium_until && new Date(user.premium_until) < now) {
            return false;
        }

        // Lấy gói premium của user (nếu có)
        if (!user.premium_package_id) return false;
        
        const pkg = await PremiumPackage.findById(user.premium_package_id).select('benefit_ids');
        if (!pkg) return false;

        // Kiểm tra quyền lợi có trong gói không
        if (!pkg.benefit_ids?.includes(benefitId)) {
            return false;
        }

        // Kiểm tra quyền lợi có được admin bật không
        const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
        const benefit = setting?.premium_benefits?.find(b => b.id === benefitId);
        
        return benefit?.is_active === true;
    } catch (err) {
        console.error("Lỗi kiểm tra quyền lợi:", err);
        return false;
    }
}

/**
 * Kiểm tra xem quyền lợi có tồn tại trong hệ thống không
 * @param {string} benefitId - ID của quyền lợi
 * @returns {Promise<boolean>}
 */
async function benefitExists(benefitId) {
    try {
        const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
        return setting?.premium_benefits?.some(b => b.id === benefitId) || false;
    } catch (err) {
        console.error("Lỗi kiểm tra quyền lợi:", err);
        return false;
    }
}

/**
 * Kiểm tra xem quyền lợi có được bật không
 * @param {string} benefitId - ID của quyền lợi
 * @returns {Promise<boolean>}
 */
async function benefitIsActive(benefitId) {
    try {
        const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
        const benefit = setting?.premium_benefits?.find(b => b.id === benefitId);
        return benefit?.is_active === true;
    } catch (err) {
        console.error("Lỗi kiểm tra quyền lợi:", err);
        return false;
    }
}

/**
 * Lấy tất cả quyền lợi được bật
 * @returns {Promise<Array>}
 */
async function getActiveBenefits() {
    try {
        const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
        return setting?.premium_benefits?.filter(b => b.is_active) || [];
    } catch (err) {
        console.error("Lỗi lấy quyền lợi:", err);
        return [];
    }
}

module.exports = {
    userHasBenefit,
    benefitExists,
    benefitIsActive,
    getActiveBenefits
};
