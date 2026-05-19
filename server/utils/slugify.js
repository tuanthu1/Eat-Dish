/**
 * Convert string to slug (ID format)
 * VD: "Truy cập công thức VIP" → "access_vip_recipes"
 */
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
        .replace(/[^\w\s-]/g, '') // Xóa ký tự đặc biệt
        .replace(/\s+/g, '_') // Space thành underscore
        .replace(/-+/g, '_') // Dash thành underscore
        .replace(/_+/g, '_') // Nhiều underscore thành 1
        .replace(/^_+|_+$/g, ''); // Xóa _ ở đầu/cuối
}

module.exports = { generateSlug };
