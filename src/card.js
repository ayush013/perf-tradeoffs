import { useRef } from "react";

const somethingReallyExpensive = (ms, enableFsl = false) => {
  const cards = document.querySelectorAll(".card");

  var start = new Date();
  while (new Date() - start < ms) {
    if (enableFsl) {
      cards.forEach((card) => {
        card.style.height = `${card.offsetHeight + 10}px`;
        card.style.width = `${card.offsetWidth + 10}px`;
      });
    }
  }
};

const Card = ({ focused = false, isPerfEnabled, enableFsl = false }) => {
  const bgImage = useRef(
    `https://picsum.photos/id/${Math.round(Math.random() * 100)}/400/300`
  );

  !isPerfEnabled && somethingReallyExpensive(50, enableFsl);

  return (
    <div
      className="card"
      style={{
        borderRadius: "0.5rem",
        minHeight: "200px",
        width: "100%",
        border: focused ? "4px solid white" : undefined,
        transform: focused ? "scale(1.05)" : undefined,
        transition: "0.2s ease",
        background: `url(${bgImage.current})`,
        backgroundSize: "cover"
      }}
    ></div>
  );
};

export default Card;
