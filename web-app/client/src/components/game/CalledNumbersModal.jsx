import React from 'react';

const CalledNumbersModal = ({ isOpen, onClose, calledNumbers }) => {
    if (!isOpen) return null;

    const getLetter = (n) => {
        if (n >= 1 && n <= 15) return 'B';
        if (n >= 16 && n <= 30) return 'I';
        if (n >= 31 && n <= 45) return 'N';
        if (n >= 46 && n <= 60) return 'G';
        if (n >= 61 && n <= 75) return 'O';
        return '';
    };

    return (
        <div className="called-numbers-modal-overlay" onClick={onClose}>
            <div className="called-numbers-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="called-numbers-modal-close" onClick={onClose}>&times;</button>
                <h2 className="called-numbers-modal-title">All Recently Called Numbers</h2>
                <div className="called-numbers-grid">
                    {[...calledNumbers].reverse().map((num, idx) => {
                        const n = parseInt(num, 10);
                        const letter = getLetter(n);
                        return (
                            <div key={idx} className="last-called-num-view-all" data-letter={letter}>
                                <span>{letter}</span>
                                <span>{num}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalledNumbersModal;
