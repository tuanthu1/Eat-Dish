import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Modal from '../Modal'; 

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
    const [fullname, setFullname] = useState('');
    const [bio, setBio] = useState('');
    const [username, setUsername] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState('');
    const [previewCover, setPreviewCover] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser) {
            setFullname(currentUser.fullname || '');
            setBio(currentUser.bio || '');
            setPreviewAvatar(currentUser.avatar || '');
            setPreviewCover(currentUser.cover_img || ''); 
            setAvatarFile(null);
            setCoverFile(null);
        }
    }, [isOpen, currentUser]);

    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file)); 
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg(''); setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('fullname', fullname);
            formData.append('bio', bio);
            formData.append('username', username); 
            if (avatarFile) formData.append('avatar', avatarFile);
            if (coverFile) formData.append('cover_img', coverFile); 
            
            const token = localStorage.getItem('token') || localStorage.getItem('ACCESS_TOKEN');
            if (!token) { setError("Bạn chưa đăng nhập!"); setIsLoading(false); return; }

            const res = await axiosClient.put('/users/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });

            if (res.data.status === 'success') {
                setSuccessMsg("Cập nhật thành công! ");
                onUpdateSuccess(res.data.user);
                onClose();
            }
        } catch (err) {
            if (err.response && err.response.status === 401) setError("Phiên đăng nhập hết hạn!");
            else setError("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
        } finally { setIsLoading(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="✏️ Chỉnh sửa thông tin">
            <form onSubmit={handleSaveProfile} className="edit-form-scroll">
                
                <div className="edit-form-group">
                    <label className="edit-label">Ảnh bìa</label>
                    <div className="edit-cover-container">
                        {previewCover ? (
                            <img src={previewCover} alt="Cover" className="edit-cover-preview" />
                        ) : (
                            <div className="edit-cover-empty">Chưa có ảnh bìa</div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setCoverFile, setPreviewCover)} className="edit-file-input" />
                    </div>
                </div>

                <div className="edit-form-group center">
                    <label className="edit-label">Avatar</label>
                    <div className="edit-avatar-container">
                        <img src={previewAvatar || 'https://via.placeholder.com/100'} alt="Avatar" className="edit-avatar-preview" />
                        <div className="edit-avatar-icon">📷</div>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setAvatarFile, setPreviewAvatar)} className="edit-file-input circle" />
                    </div>
                </div>

                <div className="edit-form-group">
                    <label className="edit-label">Tên hiển thị</label>
                    <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} className="edit-input" placeholder="Nhập tên hiển thị của bạn" />
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
    );
};
export default EditProfileModal;