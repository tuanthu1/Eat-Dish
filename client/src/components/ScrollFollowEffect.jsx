import React, { useEffect, useRef } from 'react';

const ScrollFollowEffect = ({ className = '' }) => {
    const elRef = useRef(null);
    const hideTimer = useRef(null);
    const lastPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    useEffect(() => {
        const el = elRef.current;
        const scrollContainer = document.querySelector('.main-content') || window;

        const showAt = (clientX, clientY) => {
            lastPos.current = { x: clientX, y: clientY };
            if (!el) return;
            el.style.left = `${clientX}px`;
            el.style.top = `${clientY}px`;
            el.classList.add('scroll-follow-visible');
            if (hideTimer.current) clearTimeout(hideTimer.current);
            hideTimer.current = setTimeout(() => {
                el.classList.remove('scroll-follow-visible');
            }, 700);
        };

        const onPointerMove = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            showAt(x, y);
        };

        const onTouchMove = (e) => {
            if (!e.touches || e.touches.length === 0) return;
            const t = e.touches[0];
            showAt(t.clientX, t.clientY);
        };

        const onScroll = () => {
            // when scrolling, keep effect at last known pointer position (or center)
            const { x, y } = lastPos.current || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            showAt(x, y);
        };

        // listen to pointer/touch on the scroll container so position matches user gesture
        try {
            scrollContainer.addEventListener('pointermove', onPointerMove, { passive: true });
            scrollContainer.addEventListener('touchmove', onTouchMove, { passive: true });
            scrollContainer.addEventListener('scroll', onScroll, { passive: true });
        } catch (err) {
            window.addEventListener('pointermove', onPointerMove, { passive: true });
            window.addEventListener('touchmove', onTouchMove, { passive: true });
            window.addEventListener('scroll', onScroll, { passive: true });
        }

        return () => {
            try {
                scrollContainer.removeEventListener('pointermove', onPointerMove);
                scrollContainer.removeEventListener('touchmove', onTouchMove);
                scrollContainer.removeEventListener('scroll', onScroll);
            } catch (err) {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('touchmove', onTouchMove);
                window.removeEventListener('scroll', onScroll);
            }
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);

    return (
        <div ref={elRef} className={`scroll-follow-effect ${className}`}></div>
    );
};

export default ScrollFollowEffect;
