import React from 'react';
import { Crown } from 'lucide-react';

const PremiumIcon = ({ size = 16 }) => {
    const wrapperStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 8,
        height: size + 8,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ffd66b 0%, #ffb84d 45%, rgba(255,159,28,0.95) 100%)',
        boxShadow: '0 4px 10px rgba(255, 159, 28, 0.18)',
        border: 'none',
        padding: 2
    };
    return (
        <span style={wrapperStyle} className="premium-icon-badge">
            <Crown size={size} color="#fff" />
        </span>
    );
};

export default PremiumIcon;
