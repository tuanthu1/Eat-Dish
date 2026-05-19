import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axiosClient from '../../api/axiosClient';
import { Trash2, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ChatHistoryView = ({ userId: propUserId }) => {
    const navigate = useNavigate();
    const [chatHistories, setChatHistories] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const normalizeUserId = (value) => {
        if (!value || value === 'undefined' || value === 'null') return null;
        return value;
    };

    const isValidMongoId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

    // Lấy userId từ prop hoặc localStorage
    const getUserId = () => {
        const normalizedPropUserId = normalizeUserId(propUserId);
        if (isValidMongoId(normalizedPropUserId)) return normalizedPropUserId;
        
        // Cố gắng lấy từ localStorage - cơ bản có thể là JSON hoặc chuỗi ID
        try {
            const userStr = localStorage.getItem('user') || localStorage.getItem('eatdish_user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                const localUserId = normalizeUserId(userData?.id || userData?._id);
                if (isValidMongoId(localUserId)) return localUserId;
            }
        } catch (e) {}
        
        const storedUserId = normalizeUserId(localStorage.getItem('eatdish_user_id'));
        return isValidMongoId(storedUserId) ? storedUserId : null;
    };
    
    const currentUserId = getUserId();

    useEffect(() => {
        if (currentUserId) {
            loadChatHistories();
        }
    }, [currentUserId]);

    const loadChatHistories = async () => {
        if (!isValidMongoId(currentUserId)) {
            toast.error('Vui lòng đăng nhập để xem lịch sử chat');
            return;
        }

        try {
            setIsLoading(true);
            const res = await axiosClient.get(`/chat-history/${currentUserId}`);
            setChatHistories(res.data || []);
        } catch (err) {
            console.log('Lỗi tải lịch sử chat:', err);
            toast.error('Không thể tải lịch sử chat');
        } finally {
            setIsLoading(false);
        }
    };

    const loadChatDetail = async (chatId) => {
        try {
            const res = await axiosClient.get(`/chat-history/detail/${chatId}`);
            setSelectedChat(res.data);
        } catch (err) {
            toast.error('Không thể tải chi tiết chat');
        }
    };

    const handleDeleteChat = async (chatId) => {
        if (window.confirm('Bạn chắc chắn muốn xóa cuộc trò chuyện này?')) {
            try {
                await axiosClient.delete(`/chat-history/${chatId}`);
                toast.success('Đã xóa cuộc trò chuyện');
                loadChatHistories();
                if (selectedChat?._id === chatId) {
                    setSelectedChat(null);
                }
            } catch (err) {
                toast.error('Lỗi xóa cuộc trò chuyện');
            }
        }
    };

    const handleDeleteAllChats = async () => {
        if (!isValidMongoId(currentUserId)) {
            toast.error('Vui lòng đăng nhập để xem lịch sử chat');
            return;
        }

        if (window.confirm('Bạn chắc chắn muốn xóa TẤT CẢ cuộc trò chuyện?')) {
            try {
                await axiosClient.delete(`/chat-history/user/${currentUserId}`);
                toast.success('Đã xóa tất cả cuộc trò chuyện');
                loadChatHistories();
                setSelectedChat(null);
            } catch (err) {
                toast.error('Lỗi xóa cuộc trò chuyện');
            }
        }
    };

    return (
        <div style={{ display: 'flex', height: '600px', gap: '20px' }}>
            {/* Danh sách lịch sử chat */}
            <div style={{
                flex: 1,
                borderRight: '1px solid #eee',
                paddingRight: '20px',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>
                        <MessageCircle size={20} style={{ marginRight: '8px' }} />
                        Lịch sử chat
                    </h3>
                    {chatHistories.length > 0 && (
                        <button
                            onClick={handleDeleteAllChats}
                            style={{
                                padding: '6px 12px',
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Xóa tất cả
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', color: '#999' }}>Đang tải...</div>
                ) : chatHistories.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                        Chưa có lịch sử chat nào
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {chatHistories.map(chat => (
                            <div
                                key={chat._id}
                                onClick={() => loadChatDetail(chat._id)}
                                style={{
                                    padding: '12px',
                                    border: selectedChat?._id === chat._id ? '2px solid #ff9f1c' : '1px solid #eee',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selectedChat?._id === chat._id ? '#fff9f0' : '#fff',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                                    {chat.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                                    {new Date(chat.updatedAt).toLocaleString('vi-VN')}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteChat(chat._id);
                                    }}
                                    style={{
                                        padding: '4px 8px',
                                        background: '#e74c3c',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chi tiết cuộc trò chuyện */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedChat ? (
                    <div>
                        <h3 style={{ color: '#333', marginTop: 0 }}>{selectedChat.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {selectedChat.messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '12px',
                                        background: msg.isBot ? '#f0f0f0' : '#ff9f1c20',
                                        borderRadius: '8px',
                                        borderLeft: `4px solid ${msg.isBot ? '#999' : '#ff9f1c'}`
                                    }}
                                >
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                        <strong>{msg.isBot ? '🤖 AI' : '👤 Bạn'}</strong>
                                    </div>
                                    <div style={{ color: '#333', lineHeight: '1.5' }}>
                                        {msg.isBot ? (
                                            <div className="chatbot-markdown-content">
                                                <ReactMarkdown
                                                    components={{
                                                        a: ({ node, ...props }) => (
                                                            <span
                                                                className="chatbot-md-link"
                                                                onClick={() => props.href && navigate(props.href)}
                                                            >
                                                                {props.children}
                                                            </span>
                                                        )
                                                    }}
                                                >
                                                    {msg.text || ''}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                        {new Date(msg.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#999', paddingTop: '100px' }}>
                        Chọn một cuộc trò chuyện để xem chi tiết
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHistoryView;
