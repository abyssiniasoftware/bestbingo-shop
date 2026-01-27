
const GameHeader = ({ isPlaying, stake, winAmount, callCount }) => {
  return (
    <div className="bingo-stat">
      <span style={{
        fontFamily: "'jaro', sans-serif",
        fontSize: "3.5rem",
        fontWeight: "bold",
        color: "white",
        textTransform: "uppercase",
        marginRight: 10,
      }}>
        BINGO
      </span>
      <span className="stat-box">{isPlaying ? "GAME PLAYING" : "GAME"}</span>
      <span className="stat-box">STAKE {stake}</span>
      <span className="stat-box">WIN PRICE {winAmount > 0 ? winAmount : ""}</span>
      <span className="stat-box">{callCount} CALLED</span>
    </div>
  );
};

export default GameHeader;