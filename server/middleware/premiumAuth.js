const { userHasBenefit } = require('../utils/premiumUtils');

/**
 * Middleware kiểm tra user có quyền lợi cụ thể không
 * Sử dụng: router.get('/vip-feature', requirePremiumBenefit('access_vip_recipes'), controller)
 */
const requirePremiumBenefit = (benefitId) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({ message: "Vui lòng đăng nhập!" });
            }

            const hasBenefit = await userHasBenefit(userId, benefitId);
            
            if (!hasBenefit) {
                return res.status(403).json({ 
                    message: "Bạn không có quyền lợi này. Vui lòng nâng cấp gói premium!" 
                });
            }

            next();
        } catch (err) {
            console.error("Lỗi kiểm tra quyền lợi:", err);
            res.status(500).json({ message: "Lỗi server" });
        }
    };
};

module.exports = {
    requirePremiumBenefit
};
