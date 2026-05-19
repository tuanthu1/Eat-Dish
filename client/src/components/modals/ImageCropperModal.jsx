import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import Modal from '../Modal';
import { toast } from 'react-toastify';
import { ZoomIn, Square, Maximize, Smartphone } from 'lucide-react';

// --- HÀM PHỤ TRỢ: CHUYỂN ĐỔI VÙNG CẮT THÀNH FILE ẢNH ---
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas rỗng'));
                return;
            }
            const file = new File([blob], "eatdish_cooked.jpg", { type: "image/jpeg", lastModified: Date.now() });
            resolve({ file, url: URL.createObjectURL(blob) });
        }, 'image/jpeg', 0.95);
    });
}

// --- COMPONENT CHÍNH ---
const ImageCropperModal = ({ isOpen, onClose, imageSrc, imageFile, onCropDone, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(4 / 3);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    
    // THÊM STATE ĐỂ CHỨA LINK ẢNH ĐÃ CONVERT
    const [displayUrl, setDisplayUrl] = useState(null);

    // --- CỤC RADAR CHUYỂN ĐỔI FILE -> LINK Ở ĐÂY ---
    const sourceImage = imageSrc || imageFile;
    const cropDoneHandler = onCropDone || onCropComplete;

    useEffect(() => {
        if (!sourceImage) {
            setDisplayUrl(null);
            return;
        }

        // Nếu dữ liệu truyền vào là dạng File thô (Object)
        if (typeof sourceImage === 'object') {
            const objectUrl = URL.createObjectURL(sourceImage);
            setDisplayUrl(objectUrl);
            
            // Xóa rác bộ nhớ khi đóng Modal để tránh lag web
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            // Nếu đã là link sẵn (String) thì dùng luôn
            setDisplayUrl(sourceImage);
        }
    }, [sourceImage]);

    const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            if (!displayUrl || !croppedAreaPixels) {
                toast.error("Vui lòng chọn vùng cần cắt trên ảnh.");
                return;
            }

            // Nhớ truyền displayUrl vào hàm cắt, chứ không phải imageSrc gốc nữa
            const croppedImage = await getCroppedImg(displayUrl, croppedAreaPixels);
            cropDoneHandler?.(croppedImage.file, croppedImage.url);
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Đã xảy ra lỗi khi cắt ảnh!");
        }
    }, [displayUrl, croppedAreaPixels, cropDoneHandler, onClose]);

    if (!isOpen) return null;

    const aspectBtnStyle = (currentAspect) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '8px 12px',
        backgroundColor: aspect === currentAspect ? '#fff3e0' : '#f5f5f5',
        color: aspect === currentAspect ? '#ff9f1c' : '#666',
        border: `1px solid ${aspect === currentAspect ? '#ff9f1c' : '#ddd'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s',
        fontSize: '13px'
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Căn chỉnh ảnh món ăn">
            <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#222', borderRadius: '8px', overflow: 'hidden' }}>
                {/* TRUYỀN displayUrl VÀO ĐÂY */}
                {displayUrl && (
                    <Cropper
                        image={displayUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        showGrid={true}
                        onCropChange={setCrop}
                        onCropComplete={handleCropComplete}
                        onZoomChange={setZoom}
                    />
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <div>
                    <div style={{ fontSize: '13px', color: '#777', marginBottom: '8px', fontWeight: 'bold' }}>Tỷ lệ khung hình:</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={aspectBtnStyle(1)} onClick={() => setAspect(1)}>
                            <Square size={16} /> Vuông (1:1)
                        </button>
                        <button style={aspectBtnStyle(4/3)} onClick={() => setAspect(4/3)}>
                            <Maximize size={16} /> Ngang (4:3)
                        </button>
                        <button style={aspectBtnStyle(3/4)} onClick={() => setAspect(3/4)}>
                            <Smartphone size={16} /> Dọc (3:4)
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f9f9f9', padding: '10px 15px', borderRadius: '8px' }}>
                    <ZoomIn size={20} color="#ff9f1c" />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        style={{ flex: 1, accentColor: '#ff9f1c', cursor: 'pointer' }} 
                    />
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button 
                        style={{ padding: '10px 25px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#555', fontWeight: 'bold' }} 
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button 
                        style={{ padding: '10px 25px', borderRadius: '8px', border: 'none', background: '#ff9f1c', color: 'white', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(255,159,28,0.3)' }} 
                        onClick={showCroppedImage}
                    >
                        Hoàn tất cắt ảnh
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImageCropperModal;