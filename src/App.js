import "./styles.css";
import Spinner from "./spinner";
import { useEffect, useState, lazy } from "react";
import { initPerfObserver } from "./perf-observer";
import { Suspense } from "react";
import ChunkedProcessingDemo from "./ChunkedProcessingDemo";

const somethingReallyExpensive = (ms) => {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // do nothing
  }
  console.log("done");
};

const LazyModal = lazy(() =>
  import("react-modal").then((Modal) => {
    console.log("Modal", Modal);
    Modal.default.setAppElement("#root");
    return Modal;
  })
);

const WAIT_TIME = 2000;

const debounce = (fn, ms) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};

export default function App() {
  const [taskQueue, setTaskQueue] = useState([]);
  const [isChunkedProcessingDemoActive, setIsChunkedProcessingDemoActive] =
    useState(false);

  useEffect(() => {
    initPerfObserver();
  }, []);

  const [modalIsOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (taskQueue.length > 0) {
      const task = taskQueue[0];
      const taskWithStateUpdate = (ms) => {
        task(ms);
        setTaskQueue((queue) => queue.slice(1));
      };
      const debouncedTask = debounce(taskWithStateUpdate, 1000);
      debouncedTask(WAIT_TIME);
    }
  }, [taskQueue]);

  const preloadJS = () => {
    requestIdleCallback(() => {
      import("./heavy").then((module) => {
        console.log("loaded", module);
      });
    });
  };

  const addExpensiveTask = () => {
    setTaskQueue((queue) => [...queue, somethingReallyExpensive]);
  };

  const closeModal = () => setIsOpen(false);
  const openModal = () => {
    setIsOpen(true);
  };

  const toggleChunkedProcessingDemo = () => {
    setIsChunkedProcessingDemoActive(!isChunkedProcessingDemoActive);
  };

  return (
    <div className="root">
      <div className="main-thread">
        <span className="main-thread-text">Main thread</span>
        <div className="spinner">
          <Spinner />
        </div>
      </div>
      <div className="task-queue">
        {taskQueue.length > 0 && (
          <span className="task-queue-text">To be executed:</span>
        )}
        <div className="task-queue-list">
          {taskQueue.map((_, index) => (
            <div className="task-queue-item" key={index}>
              {generateRandomTaskFunnyName(index)}
            </div>
          ))}
        </div>
      </div>

      {modalIsOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyModal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
          >
            <h2 style={{ background: "none", color: "black" }}>Hello</h2>
          </LazyModal>
        </Suspense>
      )}

      {isChunkedProcessingDemoActive && <ChunkedProcessingDemo />}

      <div className="remote">
        <div className="buttons grid grid-cols-2 gap-4 w-full">
          <div className="button action" onClick={addExpensiveTask}>
            Add expensive task 🤑
          </div>
          <div className="button action" onClick={preloadJS}>
            Preload JS
          </div>
          <div className="button action" onClick={openModal}>
            Open Modal
          </div>
          <div className="button action" onClick={toggleChunkedProcessingDemo}>
            Chunked processing demo
          </div>
        </div>
      </div>
    </div>
  );
}

const generateRandomTaskFunnyName = (i) => {
  const funnyNames = [
    "Janky task 😫",
    "Expensive task 💰",
    "Heavy task 💪",
    "Long task 🕒",
    "Stressful task 🤯",
    "Busy task 🤒",
  ];
  return funnyNames[i % funnyNames.length];
};
