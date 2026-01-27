
const BingoBall = ({ number, size = 'large', className = '' }) => {
    // Ensure we have a valid number string or number
    const numStr = String(number || '').replace(/[^\d]/g, '');
    const num = parseInt(numStr, 10);

    // Determine BINGO letter based on standard ranges
    const getLetter = (n) => {
        if (n >= 1 && n <= 15) return 'B';
        if (n >= 16 && n <= 30) return 'I';
        if (n >= 31 && n <= 45) return 'N';
        if (n >= 46 && n <= 60) return 'G';
        if (n >= 61 && n <= 75) return 'O';
        return '';
    };

    const letter = getLetter(num);

    // Style objects for sizes are no longer needed here as they are in CSS

    return (
        <div
            className={`bingo-ball-container ${size} ${className}`}
            data-letter={letter}
        >
            <div className="bingo-ball-inner">
                <div className="bingo-ball-letter">{letter}</div>
                <div className="bingo-ball-number">{numStr}</div>
            </div>
        </div>
    );
};

export default BingoBall;
