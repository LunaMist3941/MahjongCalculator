interface HandDisplayProps {
  tiles: string[];
}

function HandDisplay({
  tiles,
}: HandDisplayProps) {
  const slots = Array.from(
    { length: 14 },
    (_, index) => tiles[index] ?? "",
  );

  return (
    <section>
      <h2>手牌</h2>

      <div>
        {slots.map((tile, index) => (
          <span
            key={index}
            style={{
              display: "inline-block",
              width: "40px",
              height: "60px",
              border: "1px solid black",
              margin: "2px",
              textAlign: "center",
              lineHeight: "60px",
            }}
          >
            {tile}
          </span>
        ))}
      </div>
    </section>
  );
}

export default HandDisplay;