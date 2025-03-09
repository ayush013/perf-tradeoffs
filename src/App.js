import "./styles.css";
import Spinner from "./spinner";
import { useEffect, useState, lazy } from "react";
import { initPerfObserver } from "./perf-observer";
import { Suspense } from "react";
import ChunkedProcessingDemo from "./ChunkedProcessingDemo";
import VirtualizationComparison from "./Virtualisation";

const somethingReallyExpensive = (ms) => {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // do nothing
  }
  console.log("done");
};

const LazyModal = lazy(() =>
  import("./mock-modal").then(() => {
    return import("./modal");
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
  const [virtualisationExampleActive, setVirtualisationExampleActive] =
    useState(false);

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

  const toggleVirtualisationDemo = () => {
    setVirtualisationExampleActive(!virtualisationExampleActive);
  };

  return (
    <div className="root">
      <div className="main-thread">
        <span className="main-thread-text">Main thread</span>
        {!virtualisationExampleActive && (
          <div className="spinner">
            <Spinner />
          </div>
        )}
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
        <Suspense fallback={<div className="p-4 text-3xl">Loading...</div>}>
          <LazyModal onClick={() => setIsOpen(false)}>
            <h2 className="text-3xl font-bold">Hello World</h2>
          </LazyModal>
        </Suspense>
      )}

      {virtualisationExampleActive && <VirtualizationComparison />}

      {isChunkedProcessingDemoActive && <ChunkedProcessingDemo />}

      <div className="remote">
        <div className="buttons grid grid-cols-2 gap-4 w-full">
          <div className="button action" onClick={addExpensiveTask}>
            Add expensive task 🤑
          </div>
          <div className="button action" onClick={preloadJS}>
            Preload JS 🪄
          </div>
          <div className="button action" onClick={openModal}>
            Open Modal 🧩
          </div>
          <div className="button action" onClick={toggleChunkedProcessingDemo}>
            Chunked processing 🕥
          </div>
          <div className="button action" onClick={toggleVirtualisationDemo}>
            Virtualisation 🏁
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
