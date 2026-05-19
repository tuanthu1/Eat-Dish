import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import Modal from '../Modal'; 
import ImageCropper from './ImageCropperModal'; 
import { toast } from 'react-toastify';

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
    const [fullname, setFullname] = useState('');
    const [bio, setBio] = useState('');
    const [username, setUsername] = useState('');
    
    const [avatarFile, setAvatarFile] = useState(null); 
    const [previewAvatar, setPreviewAvatar] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [previewCover, setPreviewCover] = useState('');
    
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && currentUser) {
            setFullname(currentUser.fullname || '');
            setBio(currentUser.bio || '');
            setUsername(currentUser.username || '');
            setPreviewAvatar(currentUser.avatar || '');
            setAvatarFile(null);
            setImageToCrop(null);
        }
    }, [isOpen, currentUser]);

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP!");
            return;
        }
        
        setImageToCrop(file);
        e.target.value = null; 
    };

    const handleCropComplete = (croppedData) => {
        // croppedData bây giờ là một object { file, url } do tao thiết kế ở Modal
        
        // Dùng luôn cái url có sẵn để làm preview
        setPreviewAvatar(croppedData.url); 
        
        // Lưu cái file thực tế vào state để lát bấm "Lưu thay đổi" thì gửi API
        setAvatarFile(croppedData.file); 
        
        // Đóng modal cắt ảnh
        setImageToCrop(null);
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setPreviewCover(URL.createObjectURL(file)); 
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
         setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('fullname', fullname);
            formData.append('bio', bio);
            formData.append('username', username); 
            
            if (avatarFile) formData.append('avatar', avatarFile);
            if (coverFile) formData.append('cover_img', coverFile); 
            
            const userStr = localStorage.getItem('user') || localStorage.getItem('eatdish_user_id');
            if (!userStr) { toast.error("Bạn chưa đăng nhập!"); setIsLoading(false); return; }

            const res = await axiosClient.put('/users/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.status === 'success') {
                toast.success("Cập nhật thành công!");
                onUpdateSuccess(res.data.user);
                onClose();
            }
        } catch (err) {
            if (err.response && err.response.status === 401) toast.error("Phiên đăng nhập hết hạn!");
            else toast.error("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title=" Chỉnh sửa thông tin">
                <form onSubmit={handleSaveProfile} className="edit-form-scroll">

                    <div className="edit-form-group center">
                        <label className="edit-label">Avatar</label>
                        <div className="edit-avatar-container">
                            <img src={previewAvatar || 'https://via.placeholder.com/100'} alt="Avatar" className="edit-avatar-preview" />
                            
                            <div className="edit-avatar-icon" onClick={() => fileInputRef.current.click()}>📸</div>
                            
                            <input 
                                type="file" 
                                accept="image/jpeg, image/png, image/webp" 
                                ref={fileInputRef}
                                onChange={handleAvatarSelect}  
                                style={{ display: 'none' }} 
                            />
                        </div>
                    </div>

                    <div className="edit-form-group">
                        <label className="edit-label">Tên hiển thị</label>
                        <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} className="edit-input" placeholder="Nhập tên hiển thị của bạn" />
                    </div>

                    <div className="edit-form-group">
                        <label className="edit-label">Tên đăng nhập(Username)</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="edit-input" placeholder="Nhập tên đăng nhập của bạn" />
                    </div>

                    <div className="edit-form-group">
                        <label className="edit-label">Giới thiệu bản thân (Bio)</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="edit-input" style={{ minHeight: '80px' }} placeholder="Hãy viết gì đó về bạn..."></textarea>
                    </div>


                    <button type="submit" disabled={isLoading} className="btn-edit-submit">
                        {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </form>
            </Modal>

            <ImageCropper 
                isOpen={!!imageToCrop} 
                onClose={() => setImageToCrop(null)} 
                imageSrc={imageToCrop}
                onCropDone={handleCropComplete}
            />
        </>
    );
};

export default EditProfileModal;