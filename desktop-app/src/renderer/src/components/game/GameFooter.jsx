const GameFooter = () => {
  return (
    <footer
      className="cashier-footer"
      style={{
        textAlign: "center",
        marginTop: 6,
        padding: "12px 8px",
        fontSize: "0.875rem",
      }}
    >
      © {new Date().getFullYear()} Abyssinia Software Technology PLC. All Rights Reserved.
    </footer>
  );
};

export default GameFooter;