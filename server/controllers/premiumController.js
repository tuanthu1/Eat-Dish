const PremiumPackage = require('../models/PremiumPackage');
const User = require('../models/UserModel');
const SiteSetting = require('../models/SiteSetting');
const { generateSlug } = require('../utils/slugify');

// ============ PREMIUM BENEFITS MANAGEMENT ============

// Admin: Lấy danh sách quyền lợi premium có thể sử dụng
exports.getAvailableBenefits = async (req, res) => {
    try {
        const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
        const benefits = setting?.premium_benefits || [];
        res.json(benefits);
    } catch (err) {
        console.error("Lỗi lấy danh sách quyền lợi:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Admin: Thêm quyền lợi premium mới vào hệ thống
exports.addBenefit = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Chỉ admin mới có quyền quản lý quyền lợi" });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Tên quyền lợi là bắt buộc" });
        }

        let setting = await SiteSetting.findOne({ key: 'premium_benefits' });
        
        if (!setting) {
            setting = new SiteSetting({
                key: 'premium_benefits',
                value: {}, // Set value field (required by schema)
                premium_benefits: []
            });
        }

        // Ensure value field exists
        if (!setting.value) {
            setting.value = {};
        }

        // Tự động generate ID từ name
        let id = generateSlug(name);
        let counter = 1;
        
        // Nếu ID đã tồn tại, thêm số vào cuối
        while (setting.premium_benefits.some(b => b.id === id)) {
            id = generateSlug(name) + '_' + counter;
            counter++;
        }

        setting.premium_benefits.push({
            id,
            name,
            description: description || '',
            is_active: true
        });

        await setting.save();
        res.status(201).json({ 
            message: "Thêm quyền lợi thành công", 
            benefit: setting.premium_benefits[setting.premium_benefits.length - 1]
        });
    } catch (err) {
        console.error("Lỗi thêm quyền lợi:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Admin: Cập nhật quyền lợi (bật/tắt hoặc sửa thông tin)
exports.updateBenefit = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Chỉ admin mới có quyền quản lý quyền lợi" });
        }

        const { benefitId } = req.params;
        const { name, description, is_active } = req.body;

        const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
        
        if (!setting) {
            return res.status(404).json({ message: "Không tìm thấy danh sách quyền lợi" });
        }

        const benefit = setting.premium_benefits.find(b => b.id === benefitId);
        
        if (!benefit) {
            return res.status(404).json({ message: "Quyền lợi không tồn tại" });
        }

        if (name) benefit.name = name;
        if (description !== undefined) benefit.description = description;
        if (is_active !== undefined) benefit.is_active = is_active;

        // Ensure value field exists
        if (!setting.value) {
            setting.value = {};
        }

        await setting.save();
        res.json({ 
            message: "Cập nhật quyền lợi thành công", 
            benefit 
        });
    } catch (err) {
        console.error("Lỗi cập nhật quyền lợi:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Admin: Xóa quyền lợi
exports.deleteBenefit = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Chỉ admin mới có quyền quản lý quyền lợi" });
        }

        const { benefitId } = req.params;
        const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
        
        if (!setting) {
            return res.status(404).json({ message: "Không tìm thấy danh sách quyền lợi" });
        }

        const index = setting.premium_benefits.findIndex(b => b.id === benefitId);
        
        if (index === -1) {
            return res.status(404).json({ message: "Quyền lợi không tồn tại" });
        }

        // Xóa benefit khỏi tất cả các gói
        await PremiumPackage.updateMany(
            { benefit_ids: benefitId },
            { $pull: { benefit_ids: benefitId } }
        );

        setting.premium_benefits.splice(index, 1);
        
        // Ensure value field exists
        if (!setting.value) {
            setting.value = {};
        }
        
        await setting.save();

        res.json({ message: "Xóa quyền lợi và cập nhật các gói thành công" });
    } catch (err) {
        console.error("Lỗi xóa quyền lợi:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ============ PREMIUM PACKAGES MANAGEMENT ============

// Helper: Validate benefit IDs
async function validateBenefitIds(benefitIds) {
    const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
    const availableBenefits = setting?.premium_benefits || [];
    
    const invalidIds = benefitIds.filter(id => !availableBenefits.some(b => b.id === id));
    
    if (invalidIds.length > 0) {
        throw new Error(`Quyền lợi không hợp lệ: ${invalidIds.join(', ')}`);
    }
    
    return true;
}

// Helper: Enrich packages với benefit details
async function enrichPackagesWithBenefits(packages) {
    const setting = await SiteSetting.findOne({ key: 'premium_benefits' });
    const benefitsMap = new Map();
    
    (setting?.premium_benefits || []).forEach(b => {
        benefitsMap.set(b.id, b);
    });

    return packages.map(p => {
        const obj = p.toObject();
        obj.id = obj._id;
        obj.benefits = (obj.benefit_ids || [])
            .map(id => benefitsMap.get(id))
            .filter(b => b !== undefined);
        delete obj.benefit_ids;
        return obj;
    });
}

// Lấy danh sách gói (user)
exports.getAllPackages = async (req, res) => {
    try {
        const packages = await PremiumPackage.find({ is_active: true }).sort({ level: 1, createdAt: -1 });
        const enriched = await enrichPackagesWithBenefits(packages);
        res.json(enriched);
    } catch (err) { 
        console.error("Lỗi lấy danh sách gói:", err);
        res.status(500).json({ message: "Lỗi server" }); 
    }
};

// Lấy thông tin trạng thái VIP của user
exports.getUserPremiumStatus = async (req, res) => {
    try {
        const userId = req.user?.id; 
        
        if (!userId) {
            return res.status(401).json({ message: "Vui lòng đăng nhập!" });
        }
        const user = await User.findById(userId).select('is_premium premium_until');
        
        if (user) {
            res.json(user); 
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
    } catch (err) { 
        console.error("Lỗi lấy thông tin VIP:", err);
        res.status(500).json({ message: "Lỗi server" }); 
    }
};

// Admin: Cập nhật gói dịch vụ
exports.updatePackage = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Chỉ admin mới có quyền quản lý gói dịch vụ" });
        }

        const { packageId } = req.params;
        const { name, price, duration_days, description, benefit_ids, is_active, level } = req.body;

        // Validate benefit IDs nếu có
        if (benefit_ids && benefit_ids.length > 0) {
            await validateBenefitIds(benefit_ids);
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (price) updateData.price = price;
        if (duration_days) updateData.duration_days = duration_days;
        if (description !== undefined) updateData.description = description;
        if (level !== undefined) updateData.level = Number(level);
        if (benefit_ids !== undefined) {
            updateData.benefit_ids = Array.isArray(benefit_ids) ? benefit_ids : [];
        }
        if (is_active !== undefined) updateData.is_active = is_active;

        const pkg = await PremiumPackage.findByIdAndUpdate(packageId, updateData, { returnDocument: 'after' });
        
        if (!pkg) {
            return res.status(404).json({ message: "Gói dịch vụ không tồn tại" });
        }

        const enriched = await enrichPackagesWithBenefits([pkg]);
        res.json({ message: "Cập nhật gói dịch vụ thành công", package: enriched[0] });
    } catch (err) {
        console.error("Lỗi cập nhật gói:", err);
        const statusCode = err.message.includes("không hợp lệ") ? 400 : 500;
        res.status(statusCode).json({ message: err.message || "Lỗi server" });
    }
};

// Admin: Tạo gói dịch vụ mới
exports.createPackage = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Chỉ admin mới có quyền tạo gói dịch vụ" });
        }

        const { name, price, duration_days, description, benefit_ids, level } = req.body;
        
        if (!name || !price || !duration_days) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin gói" });
        }

        // Validate benefit IDs
        if (benefit_ids && benefit_ids.length > 0) {
            await validateBenefitIds(benefit_ids);
        }

        const newPkg = await PremiumPackage.create({
            name,
            price,
            duration_days,
            description: description || '',
            level: Number(level ?? 1),
            benefit_ids: Array.isArray(benefit_ids) ? benefit_ids : [],
            is_active: true
        });

        const enriched = await enrichPackagesWithBenefits([newPkg]);
        res.status(201).json({ message: "Tạo gói dịch vụ thành công", package: enriched[0] });
    } catch (err) {
        console.error("Lỗi tạo gói:", err);
        const statusCode = err.message.includes("không hợp lệ") ? 400 : 500;
        res.status(statusCode).json({ message: err.message || "Lỗi server" });
    }
};

// Admin: Xóa gói dịch vụ
exports.deletePackage = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Chỉ admin mới có quyền xóa gói dịch vụ" });
        }

        const { packageId } = req.params;
        const pkg = await PremiumPackage.findByIdAndDelete(packageId);
        
        if (!pkg) {
            return res.status(404).json({ message: "Gói dịch vụ không tồn tại" });
        }

        res.json({ message: "Xóa gói dịch vụ thành công" });
    } catch (err) {
        console.error("Lỗi xóa gói:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Admin: Lấy toàn bộ gói (bao gồm cả đang tắt)
exports.getAllPackagesForAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Chỉ admin mới có quyền quản lý gói dịch vụ" });
        }

        const packages = await PremiumPackage.find({}).sort({ level: 1, createdAt: -1 });
        const enriched = await enrichPackagesWithBenefits(packages);
        res.json(enriched);
    } catch (err) {
        console.error("Lỗi lấy danh sách gói (admin):", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy 1 gói theo ID (user) - hỗ trợ frontend gọi /packages/:id
exports.getPackageById = async (req, res) => {
    try {
        const { packageId } = req.params;

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(packageId)) {
            return res.status(404).json({ message: 'Gói dịch vụ không tồn tại' });
        }

        const pkg = await PremiumPackage.findById(packageId);
        if (!pkg) return res.status(404).json({ message: 'Gói dịch vụ không tồn tại' });

        const enriched = await enrichPackagesWithBenefits([pkg]);
        res.json(enriched[0]);
    } catch (err) {
        console.error('Lỗi lấy gói theo ID:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};