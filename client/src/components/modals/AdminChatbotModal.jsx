import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

const AdminChatbotModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [form, setForm] = useState({
        enabled: false,
        provider: 'openai',
        welcome_message: '',
        system_prompt: '',
        openai_apikey: '',
        groq_apikey: '',
        claude_apikey: '',
        gemini_apikey: '',
        other_apikey: ''
    });

    const [showApiKey, setShowApiKey] = useState({});

    const providers = [
        { value: 'openai', label: 'OpenAI', keyField: 'openai_apikey' },
        { value: 'groq', label: 'Groq', keyField: 'groq_apikey' },
        { value: 'claude', label: 'Claude (Anthropic)', keyField: 'claude_apikey' },
        { value: 'gemini', label: 'Google Gemini', keyField: 'gemini_apikey' },
        { value: 'mimo', label: 'Xiaomi MiMo', keyField: 'mimo_apikey' },
        { value: 'other', label: 'Other', keyField: 'other_apikey' }
    ];

    useEffect(() => {
        if (isOpen && initialData) {
            setForm({
                enabled: !!initialData?.enabled,
                provider: initialData?.provider || 'openai',
                welcome_message: initialData?.welcome_message || '',
                system_prompt: initialData?.system_prompt || '',
                openai_apikey: initialData?.openai_apikey || '',
                groq_apikey: initialData?.groq_apikey || '',
                claude_apikey: initialData?.claude_apikey || '',
                gemini_apikey: initialData?.gemini_apikey || '',
                mimo_apikey: initialData?.mimo_apikey || '',
                other_apikey: initialData?.other_apikey || ''
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const toggleApiKeyVisibility = (key) => {
        setShowApiKey(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(form);
    };

    const currentProvider = providers.find(p => p.value === form.provider);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cấu hình Chatbot AI">
            <form onSubmit={handleSubmit} style={{ maxWidth: 720, maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 'bold' }}>
                        <input type="checkbox" name="enabled" checked={form.enabled} onChange={handleChange} style={{ marginRight: 8 }} /> Bật Chatbot AI
                    </label>
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Nhà cung cấp</label>
                    <select name="provider" value={form.provider} onChange={handleChange} style={{ width: '100%', padding: 8 }}>
                        {providers.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Welcome message</label>
                    <input name="welcome_message" value={form.welcome_message} onChange={handleChange} rows={3} style={{ width: '100%', padding: 8 }} placeholder='vui lòng không viết vào nếu không cần thiết'/>
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>System prompt</label>
                    <textarea name="system_prompt" value={form.system_prompt} onChange={handleChange} rows={3} style={{ width: '100%', padding: 8 }} placeholder='vui lòng không viết nếu chatbot hoạt động đúng và bình thường.'/>
                </div>

                {/* API Key Management Section */}
                <div style={{ marginBottom: 12, padding: 10, background: '#f9f9f9', borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Quản lý API Keys</h4>
                    
                    {providers.map(provider => (
                        <div key={provider.value} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #ddd' }}>
                            <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, fontSize: '13px' }}>
                                {provider.label} API Key
                                <button 
                                    type="button" 
                                    onClick={() => toggleApiKeyVisibility(provider.keyField)}
                                    style={{ padding: '2px 6px', fontSize: '11px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                >
                                    {showApiKey[provider.keyField] ? '🙈' : '👁️'}
                                </button>
                            </label>
                            <input 
                                type={showApiKey[provider.keyField] ? 'text' : 'password'}
                                name={provider.keyField} 
                                value={form[provider.keyField]} 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: 6, fontSize: '12px', fontFamily: showApiKey[provider.keyField] ? 'monospace' : 'inherit' }}
                                placeholder={`${provider.label} API key`}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                    <button type="button" onClick={onClose} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Hủy</button>
                    <button type="submit" style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#ff9f1c', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>Lưu</button>
                </div>
            </form>
        </Modal>
    );
};

export default AdminChatbotModal;
