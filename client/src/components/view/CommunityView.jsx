import React from 'react';
import axiosClient from '../../api/axiosClient';

const CommunityView = ({ 
    user, postContent, setPostContent, imagePreview, setImagePreview, 
    postImage, setPostImage, handleFileChange, handleSubmitPost, 
    communityPosts, handleLikePost, handleDeletePost, handleUpdatePost,
    editingPostId, setEditingPostId, editPostContent, setEditPostContent,
    toggleComments, activeCommentPostId, commentsList, setCommentsList,
    commentText, setCommentText, replyingTo, setReplyingTo,
    handleViewProfile , editPostImage, setEditPostImage,
    editImagePreview, setEditImagePreview, handleEditFileChange
}) => {

    const handleSubmitComment = async (postId) => {
        if (!commentText.trim()) return;
        const payload = { userId: user.id, postId: postId, content: commentText, parentId: replyingTo ? replyingTo.id : null };
        try {
            await axiosClient.post('/community/comment', payload);
            setCommentText(''); setReplyingTo(null);
            const res = await axiosClient.get(`/community/comments/${postId}`);
            setCommentsList(res.data);
        } catch (err) { console.error("Lỗi gửi comment:", err); }
    };

    return (
        <div id="view-community" className="fadeIn community-view-container">
            <div className="section-header"><h2>Cộng đồng EatDish 👥</h2></div>
            
            {/* Ô ĐĂNG BÀI */}
            <div className="community-post-box">
                <div className="community-post-input-wrapper">
                    <img src={user.avatar} className="community-comment-avt-large" alt="avt" />
                    <textarea 
                        placeholder={`Chia sẻ công thức hoặc mẹo nấu ăn đi, ${user.fullname}...`}
                        value={postContent} onChange={(e) => setPostContent(e.target.value)}
                        className="community-post-input"
                    />
                </div>
                {imagePreview && (
                    <div className="community-img-preview-box">
                        <img src={imagePreview} className="community-img-preview" alt="preview" />
                        <button onClick={() => { setPostImage(null); setImagePreview(null); }} className="btn-remove-preview">✕</button>
                    </div>
                )}
                <div className="community-post-actions">
                    <label className="community-add-img-label">
                        <span style={{ fontSize: '20px' }}>🖼️</span> Thêm ảnh
                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                    </label>
                    <button onClick={handleSubmitPost} className="btn-community-post">Đăng bài</button>
                </div>
            </div>

            {/* DANH SÁCH BÀI ĐĂNG */}
            {communityPosts.map(post => (
                <div key={post.id} className="community-post-item">
                    <div className="community-post-header">
                        <div className="community-post-author">
                            <img src={post.avatar} onClick={() => handleViewProfile(post.user_id)} className="community-author-avt" alt="avt" />
                            <div>
                                <div onClick={() => handleViewProfile(post.user_id)} className="community-author-name">{post.fullname}</div>
                                <div className="community-post-date">{new Date(post.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                        
                        {post.user_id == user.id && (
                            <div className="community-post-manage">
                                <span onClick={() => { setEditingPostId(post.id); setEditPostContent(post.content); setEditImagePreview(post.image_url); setEditPostImage(null); }} className="btn-post-manage">✏️ Sửa</span>
                                <span onClick={() => handleDeletePost(post.id)} className="btn-post-manage delete">🗑️ Xóa</span>
                            </div>
                        )}
                    </div>

                    {editingPostId === post.id ? (
                        <div className="community-edit-box">
                            <div className="community-edit-title">Đang chỉnh sửa:</div>
                            <textarea value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)} className="community-post-input editing" />

                            <div className="mb-10">
                                {editImagePreview ? (
                                    <div className="community-img-preview-box inline">
                                        <img src={editImagePreview} className="community-img-preview small" alt="edit-preview" />
                                        <button onClick={() => { setEditPostImage(null); setEditImagePreview(null); }} className="btn-remove-preview small" title="Xóa ảnh">✕</button>
                                    </div>
                                ) : (
                                    <div className="community-empty-img-msg">Bài viết này chưa có ảnh</div>
                                )}
                                <div className="mt-10">
                                    <label className="btn-change-img">
                                        📷 Thay đổi ảnh <input type="file" accept="image/*" hidden onChange={handleEditFileChange} />
                                    </label>
                                </div>
                            </div>
                            <div className="community-edit-actions">
                                <button onClick={() => handleUpdatePost(post.id)} className="btn-edit-save">Lưu lại</button>
                                <button onClick={() => setEditingPostId(null)} className="btn-edit-cancel">Hủy</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="community-post-content">{post.content}</p>
                            {post.image_url && <img src={post.image_url} className="community-post-image" alt="post" />}
                        </>
                    )}
                    
                    <div className="community-interact-row">
                        <button onClick={() => handleLikePost(post.id)} className={`btn-interact ${post.is_liked ? 'liked' : ''}`}>
                            {post.is_liked ? '❤️' : '🤍'} {post.likes_count || 0} Thích
                        </button>
                        <button onClick={() => toggleComments(post.id)} className="btn-interact">💬 Bình luận</button>
                    </div>

                    {/* BÌNH LUẬN */}
                    {activeCommentPostId === post.id && (
                        <div className="fadeIn community-comments-section">
                            <div className="community-comments-list">
                                {commentsList.length > 0 ? (
                                    commentsList.filter(c => !c.parent_id).map(parentCmt => (
                                        <div key={parentCmt.id} className="community-comment-item">
                                            <div className="community-comment-parent">
                                                <img src={parentCmt.avatar} className="community-comment-avt" alt="avt" />
                                                <div className="flex-1">
                                                    <div className="community-comment-bubble">
                                                        <strong>{parentCmt.fullname}</strong>
                                                        <span className="community-comment-meta">{new Date(parentCmt.created_at).toLocaleDateString()}</span>
                                                        <div className="community-comment-text">{parentCmt.content}</div>
                                                    </div>
                                                    <div onClick={() => setReplyingTo(parentCmt)} className="btn-reply-comment">Trả lời</div>
                                                </div>
                                            </div>
                                            {commentsList.filter(c => c.parent_id === parentCmt.id).map(childCmt => (
                                                <div key={childCmt.id} className="community-comment-child">
                                                    <img src={childCmt.avatar} className="community-child-avt" alt="avt" />
                                                    <div className="community-child-bubble">
                                                        <strong>{childCmt.fullname}</strong>
                                                        <div className="community-comment-text">{childCmt.content}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    <p className="community-comment-empty">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                                )}
                            </div>
                            
                            <div className="community-comment-input-area">
                                {replyingTo && (
                                    <div className="community-reply-indicator">
                                        <span>Đang trả lời <b>{replyingTo.fullname}</b>...</span>
                                        <span onClick={() => setReplyingTo(null)} className="btn-cancel-reply">✕ Hủy</span>
                                    </div>
                                )}
                                <div className="community-input-row">
                                    <input 
                                        type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                                        placeholder={replyingTo ? `Trả lời ${replyingTo.fullname}...` : "Viết bình luận..."}
                                        className="community-comment-input"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                                    />
                                    <button onClick={() => handleSubmitComment(post.id)} className="btn-send-comment">➤</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CommunityView;