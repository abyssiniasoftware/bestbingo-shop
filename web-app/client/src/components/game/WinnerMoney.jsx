// components/game/WinnerMoney.jsx
import { money as MoneyIcon } from "../../images/icon";

const WinnerMoney = ({ winAmount }) => {
  return (
    <div className="winner">
      <div style={{ textAlign: "right", marginRight: 10 }}>
        <div style={{
          fontSize: "2.2rem",
          fontWeight: "bold",
          fontFamily: "'poetsen', sans-serif",
        }}>
          WIN MONEY
        </div>
        <div style={{
          fontSize: "2rem",
          fontWeight: "bold",
          fontFamily: "'poetsen', sans-serif",
        }}>
          {winAmount} Birr
        </div>
      </div>
      <img
        src={MoneyIcon}
        alt="Money"
        style={{ height: 150 }}
        onError={(e) => { e.target.src = MoneyIcon; }}
      />
    </div>
  );
};

export default WinnerMoney;