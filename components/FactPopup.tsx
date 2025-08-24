import React, { useState, useEffect } from 'react';

interface FactPopupProps {
    fact: string;
}

export const FactPopup: React.FC<FactPopupProps> = ({ fact }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // When a new fact comes in, trigger the animation
        setIsVisible(false);
        const fadeInTimer = setTimeout(() => {
            setIsVisible(true);
        }, 100); // Short delay to allow CSS transition to trigger

        return () => {
            clearTimeout(fadeInTimer);
        };
    }, [fact]);

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-200 max-w-4xl mx-auto flex items-center space-x-4">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex-shrink-0">Did you know?</h4>
                <p className="text-slate-600 leading-relaxed text-center flex-grow">{fact}</p>
            </div>
        </div>
    );
};