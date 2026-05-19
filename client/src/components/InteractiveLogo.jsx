import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo/logo.png';
import logo3 from '../logo/logo3.png';

const InteractiveLogo = ({ scale = 1, className = '' }) => {
    const navigate = useNavigate();

    const handleNavigateHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    return (
        <button
            type="button"
            className={`interactive-logo-container ${className}`.trim()}
            onClick={handleNavigateHome}
            aria-label="Về trang chủ EatDish"
            style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                transform: `scale(${scale})`,
                transformOrigin: 'left center',
                display: 'block',
                width: '160px',
                overflow: 'visible'
            }}
        >
            <img
                src={logo3}
                alt="EatDish"
                className="interactive-logo-text"
                style={{
                    width: '160px',
                    height: 'auto',
                    objectFit: 'contain',
                    userSelect: 'none',
                    display: 'block'
                }}
                draggable="false"
            />

            <img
                src={logo}
                alt="EatDish logo"
                className="interactive-logo-hat"
                style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'contain',
                    userSelect: 'none'
                }}
                draggable="false"
            />
        </button>
    );
};

export default React.memo(InteractiveLogo);
