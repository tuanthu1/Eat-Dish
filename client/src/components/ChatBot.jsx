import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ReactMarkdown from 'react-markdown';
import linhvat from '../logo/linhvat.png'; 
import '../index.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    // VẪN GIỮ LẠI TÍNH NĂNG LƯU LỊCH SỬ CHAT
    const [messages, setMessages] = useState(() => {
        const savedChat = localStorage.getItem("eatdish_chat_history");
        return savedChat ? JSON.parse(savedChat) : [{ text: "Xin chào! Bạn muốn tìm món gì hôm nay? (Gà, Bò, Hải sản...)", isBot: true }];
    });
    
    const [suggestedQuestions] = useState([
        "Hôm nay ăn gì nhỉ? 🤔",
        "Gợi ý món gà ngon 🐔",
        "Có món nào từ heo không? 🐷",
        "Thực đơn hải sản 🦀",
        "Món ngon từ trứng 🥚",
        "Tìm món cá 🐟",
        "Random món bất kỳ 🎲"
    ]);

    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [showBubble, setShowBubble] = useState(true);

    const scrollRef = useRef(null);
    const BOT_AVATAR = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png";
    const navigate = useNavigate();
    useEffect(() => {
        localStorage.setItem("eatdish_chat_history", JSON.stringify(messages));
    }, [messages]);

    // Kiểm tra đăng nhập
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            setIsGuest(!token);
            if (!token) {
                localStorage.removeItem("eatdish_chat_history");
                setMessages([{ text: "Xin chào! Bạn muốn tìm món gì hôm nay? (Gà, Bò, Hải sản...)", isBot: true }]);
            }
        };
        checkAuth();
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    // Tự động cuộn xuống cuối
    useEffect(() => {
        if(isOpen) {
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages, isOpen, isTyping]);

    // Tắt bong bóng chào sau 10s
    useEffect(() => {
        const timer = setTimeout(() => setShowBubble(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleOpenChat = () => {
        if (isGuest) {
            navigate('/login-register'); 
            return;
        }
        setIsOpen(true);
        setShowBubble(false); 
    };

    // Hàm gửi tin nhắn
    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { text: text, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const res = await axiosClient.post('/chat', { message: text });
            setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
        } catch (err) {
            const errorMsg = err.response?.data?.reply || "Xin lỗi, bếp đang bận xíu. Bạn thử lại sau nhé! 😓";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleInputSend = () => {
        sendMessage(inputValue);
        setInputValue("");
    };

    return (
        <div className="chatbot-fixed-wrapper">
            {!isOpen && (
                <div className="chatbot-mascot-trigger" onClick={handleOpenChat}>
                    {showBubble && (
                        <div className="mascot-greeting-bubble fadeIn">
                            Tìm món ngon ngay! 🍳
                        </div>
                    )}
                    <img src={linhvat} alt="Chatbot" className="chatbot-mascot-img" />
                </div>
            )}

            {isOpen && (
                <div className="chatbot-window fadeIn">
                    <div className="chatbot-header">
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <img src={linhvat} alt="bot" style={{width:'30px', height:'30px', objectFit:'contain', background:'#fff', borderRadius:'50%'}}/>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>Trợ lý EatDish</span>
                            </div>
                        </div>
                        <span onClick={() => setIsOpen(false)} className="chatbot-close-icon">✕</span>
                    </div>

                    <div className="chatbot-messages-container">
                        {messages.map((m, i) => (
                            <div key={i} className={`chatbot-message-row ${m.isBot ? 'bot' : 'user'}`}>
                                {m.isBot && <img src={BOT_AVATAR} alt="bot" className="chatbot-avatar" />}
                                <div className={`chatbot-bubble ${m.isBot ? 'bot' : 'user'}`}>
                                    {m.isBot ? (
                                        <div className="chatbot-markdown-content">
                                            <ReactMarkdown
                                                components={{
                                                    a: ({ node, ...props }) => (
                                                        <span className="chatbot-md-link" onClick={() => navigate(props.href)}>
                                                            {props.children}
                                                        </span>
                                                    )
                                                }}
                                            >
                                                {m.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : m.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                           <div className="chatbot-message-row bot">
                                <img src={BOT_AVATAR} alt="bot" className="chatbot-avatar" />
                                <div className="chatbot-typing-indicator">
                                    👨‍🍳 Đang lục tìm công thức
                                    <span className="typing-dot">.</span>
                                    <span className="typing-dot">.</span>
                                    <span className="typing-dot">.</span>
                                </div>
                            </div>
                        )}
                        {!isTyping && (
                            <div className="chatbot-suggestions-wrapper">
                                {suggestedQuestions.map((q, idx) => (
                                    <button 
                                        key={idx} 
                                        className="chatbot-suggestion-chip"
                                        onClick={() => sendMessage(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <input 
                            type="text" 
                            placeholder="Nhập tên món, nguyên liệu..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleInputSend()}
                            className="chatbot-input-field"
                        />
                        <button onClick={handleInputSend} className="chatbot-send-btn">Gửi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;