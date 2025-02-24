import "./styles.css";
import Card from "./card";
import Spinner from "./spinner";
import { useEffect, useRef, useState, useTransition } from "react";
import { initPerfObserver } from "./perf-observer";

const CARDS = 10;

export default function App() {
  const [activeCard, setActiveCard] = useState(0);
  const [activeCardValue, setActiveCardValue] = useState(activeCard);

  const [isPending, startTransition] = useTransition();

  const [isPerfEnabled, setisPerfEnabled] = useState(true);

  const remoteRef = useRef(null);

  useEffect(() => {
    const remote = remoteRef.current;

    initPerfObserver();

    const onClick = (e) => {
      if (e.target.classList.contains("action")) {
        if (e.target.id === "up") {
          setActiveCard((card) => (card - 1 < 0 ? 0 : card - 1));
          startTransition(() =>
            setActiveCardValue((card) => (card - 1 < 0 ? 0 : card - 1))
          );
        } else {
          setActiveCard((card) => (card + 1 >= CARDS ? card : card + 1));
          startTransition(() =>
            setActiveCardValue((card) => (card + 1 >= CARDS ? card : card + 1))
          );
        }
      }
    };

    remote.addEventListener("click", onClick);

    return () => {
      remote.removeEventListener("click", onClick);
      // task.abort();
    };
  }, []);

  return (
    <div className="root">
      <div
        className="App"
        style={{ transform: `translateY(-${activeCard * (200 + 32)}px)` }}
      >
        {new Array(CARDS).fill(0).map((_, index) => {
          return (
            <Card
              focused={index === activeCardValue}
              isPerfEnabled={isPerfEnabled}
              key={index}
              enableFsl={false}
            />
          );
        })}
      </div>
      <div className="remote" ref={remoteRef}>
        <div
          className="button perf-toggle"
          onClick={() => setisPerfEnabled(!isPerfEnabled)}
        >
          {isPerfEnabled ? "🚀" : "🫠"}
        </div>
        <div className="buttons">
          <div className="button action" id="up">
            ⬆️
          </div>
          <div className="button action" id="down">
            ⬇️
          </div>
        </div>
      </div>
      <div className="main-thread">
        <Spinner />
      </div>
    </div>
  );
}
