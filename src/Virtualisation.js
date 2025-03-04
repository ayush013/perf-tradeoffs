import React, { useState, useEffect, useRef } from "react";

const VirtualizationComparison = () => {
  const [activeTab, setActiveTab] = useState("virtualized");
  const [itemCount, setItemCount] = useState(1000);
  const [inpVirtualized, setInpVirtualized] = useState(null);
  const [inpNonVirtualized, setInpNonVirtualized] = useState(null);
  const [domCountVirtualized, setDomCountVirtualized] = useState(0);
  const [domCountNonVirtualized, setDomCountNonVirtualized] = useState(0);

  const virtualizedRef = useRef(null);
  const nonVirtualizedRef = useRef(null);

  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    description: `This is a description for item ${i}`,
    imageUrl: `/api/placeholder/50/50`,
  }));

  // Measure DOM elements
  useEffect(() => {
    if (virtualizedRef.current) {
      const count =
        virtualizedRef.current.querySelectorAll(".list-item").length;
      setDomCountVirtualized(count);
    }

    if (nonVirtualizedRef.current) {
      const count =
        nonVirtualizedRef.current.querySelectorAll(".list-item").length;
      setDomCountNonVirtualized(count);
    }
  }, [activeTab, itemCount]);

  // Measure INP on interaction
  const measureINP = (isVirtualized) => {
    const startTime = performance.now();

    // Simulate a scroll action
    const container = isVirtualized
      ? virtualizedRef.current
      : nonVirtualizedRef.current;
    if (container) {
      container.scrollTop =
        Math.random() * (container.scrollHeight - container.clientHeight);

      // Request animation frame to measure time to next paint
      requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        if (isVirtualized) {
          setInpVirtualized(duration.toFixed(2));
        } else {
          setInpNonVirtualized(duration.toFixed(2));
        }
      });
    }
  };

  // Virtualized list component
  const VirtualizedList = () => {
    const [startIndex, setStartIndex] = useState(0);
    const containerHeight = 400;
    const itemHeight = 70;
    const visibleItems = Math.ceil(containerHeight / itemHeight) + 2; // +2 for buffer

    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      const index = Math.floor(scrollTop / itemHeight);
      setStartIndex(index);
    };

    return (
      <div
        ref={virtualizedRef}
        className="h-96 overflow-auto border border-gray-300 rounded"
        onScroll={handleScroll}
      >
        {/* Total height placeholder */}
        <div
          style={{
            height: `${items.length * itemHeight}px`,
            position: "relative",
          }}
        >
          {/* Only render visible items */}
          {items
            .slice(startIndex, startIndex + visibleItems)
            .map((item, index) => (
              <div
                key={item.id}
                className="list-item p-4 border border-gray-200 flex items-center"
                style={{
                  position: "absolute",
                  top: `${(startIndex + index) * itemHeight}px`,
                  height: `${itemHeight}px`,
                  left: 0,
                  right: 0,
                }}
              >
                <img src={item.imageUrl} alt={item.title} className="pr-4" />
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Non-virtualized list component
  const NonVirtualizedList = () => {
    return (
      <div
        ref={nonVirtualizedRef}
        className="h-96 overflow-auto border border-gray-300 rounded"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="list-item p-4 border-b border-gray-200 flex items-center h-20"
          >
            <img src={item.imageUrl} alt={item.title} className="mr-4" />
            <div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Virtualization vs. Non-Virtualization Comparison
      </h1>

      <div className="flex flex-col space-y-4">
        <label className="flex items-center space-x-2">
          <span>Number of items:</span>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={itemCount}
            onChange={(e) => setItemCount(parseInt(e.target.value))}
            className="w-64"
          />
          <span className="w-16 text-right">{itemCount}</span>
        </label>

        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "virtualized"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("virtualized")}
          >
            Virtualized
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "non-virtualized"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("non-virtualized")}
          >
            Non-Virtualized
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        {activeTab === "virtualized" ? (
          <VirtualizedList />
        ) : (
          <NonVirtualizedList />
        )}
      </div>

      <div className="bg-white shadow rounded p-4 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h2 className="font-bold">Virtualized</h2>
          <div>
            DOM Elements:{" "}
            <span className="font-mono">{domCountVirtualized}</span>
          </div>
          <div>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => measureINP(true)}
            >
              Measure INP
            </button>
            {inpVirtualized && (
              <span className="ml-2 font-mono">{inpVirtualized}ms</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold">Non-Virtualized</h2>
          <div>
            DOM Elements:{" "}
            <span className="font-mono">{domCountNonVirtualized}</span>
          </div>
          <div>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => measureINP(false)}
            >
              Measure INP
            </button>
            {inpNonVirtualized && (
              <span className="ml-2 font-mono">{inpNonVirtualized}ms</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded text-sm">
        <p className="font-bold">Notes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            The virtualized list only renders visible items plus a small buffer,
            significantly reducing DOM elements.
          </li>
          <li>
            The non-virtualized list renders all items at once, which can lead
            to better INP but worse initial rendering and memory usage.
          </li>
          <li>
            The "Measure INP" button simulates a scroll interaction and measures
            the time to next paint.
          </li>
          <li>
            For large lists, you'll notice the virtualized implementation has
            fewer DOM elements but may have higher INP values.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VirtualizationComparison;
