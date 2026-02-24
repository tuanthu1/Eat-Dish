import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import Modal from '../Modal';

const getCroppedImg = (imageSrc, pixelCrop) => {
    const createImage = (url) => new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

    return new Promise(async (resolve, reject) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
        canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Canvas is empty')); return; }
            resolve(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }));
        }, 'image/jpeg');
    });
};

const ImageCropperModal = ({ isOpen, onClose, imageFile, onCropComplete }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    useEffect(() => {
        if (imageFile) {
            const objectUrl = URL.createObjectURL(imageFile);
            setImageSrc(objectUrl); setCrop({ x: 0, y: 0 }); setZoom(1); 
            return () => URL.revokeObjectURL(objectUrl);
        } else setImageSrc(null);
    }, [imageFile]);

    const handleCropComplete = useCallback((croppedArea, currentCroppedAreaPixels) => {
        setCroppedAreaPixels(currentCroppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage); 
            onClose();
        } catch (e) { alert('Có lỗi khi cắt ảnh!'); }
    };

    if (!imageSrc) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa hình ảnh">
            <div className="cropper-wrapper">
                <div className="cropper-inner">
                    <Cropper
                        image={imageSrc} crop={crop} zoom={zoom} aspect={1 / 1} 
                        onCropChange={setCrop} onCropComplete={handleCropComplete} onZoomChange={setZoom} showGrid={true}
                        style={{ containerStyle: { width: '100%', height: '100%' }, cropAreaStyle: { border: '3px solid rgba(255,255,255,0.6)', boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.5)' } }}
                    />
                    <button onClick={handleConfirm} className="btn-cropper-ok">Ok</button>
                    <div className="cropper-help-text">Di chuyển để thay đổi vị trí hình</div>
                </div>
            </div>
            <div className="cropper-slider-box">
                <input type="range" value={zoom} min={1} max={3} step={0.01} aria-labelledby="Zoom" onChange={(e) => setZoom(Number(e.target.value))} className="cropper-slider" />
            </div>
        </Modal>
    );
};
export default ImageCropperModal;