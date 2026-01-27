import BingoBall from "./BingoBall";

const CurrentBallPanel = ({ currentNumber, recentCalls, onViewAll }) => {
  return (
    <div className="current-ball-panel-container">
      <BingoBall number={currentNumber} size="large" />

      <div className="last-called-numbers">
        {recentCalls.slice(0, 4).map((num, idx) => (
          <BingoBall key={idx} number={num} size="small" />
        ))}
      </div>

      <div className="view-all">
        <button
          id="viewAllCalledButton"
          onClick={onViewAll}
          style={{
            backgroundColor: 'transparent',
            color: '#000',
            fontSize: 14,
            border: 'none',
            padding: '5px',
            cursor: 'pointer',
          }}
        >
          view all
        </button>
      </div>

    </div>
  );
};

export default CurrentBallPanel;