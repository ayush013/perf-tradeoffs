import React, { useState, useEffect } from "react";

const ChunkedProcessingDemo = () => {
  const [numbers, setNumbers] = useState([]);
  const [processedNumbers, setProcessedNumbers] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState("chunked");
  const [progress, setProgress] = useState(0);
  const [timeTaken, setTimeTaken] = useState({ single: null, chunked: null });
  const [uiResponsiveness, setUiResponsiveness] = useState({
    count: 0,
    lastUpdated: Date.now(),
  });

  // Generate a large array of numbers for processing
  const generateNumbers = () => {
    const arr = [];
    for (let i = 0; i < 100000; i++) {
      arr.push(i);
    }
    setNumbers(arr);
    setProcessedNumbers([]);
    setProgress(0);
    setTimeTaken({ single: null, chunked: null });
  };

  // Function to simulate expensive computation on each number
  const expensiveOperation = (num) => {
    // Simulate CPU-intensive operation
    let result = num;
    for (let i = 0; i < 1000; i++) {
      result = Math.sqrt(result * result + i);
    }
    return result;
  };

  // Process all numbers in one go (blocks the main thread)
  const processAllAtOnce = () => {
    setProcessing(true);
    setProgress(0);
    const startTime = performance.now();

    // Using setTimeout to allow UI to update before starting heavy computation
    setTimeout(() => {
      const results = numbers.map(expensiveOperation);
      setProcessedNumbers(results);
      setProgress(100);
      setProcessing(false);
      setTimeTaken((prev) => ({
        ...prev,
        single: performance.now() - startTime,
      }));
    }, 100);
  };

  // Process numbers in chunks to avoid blocking the main thread
  const processInChunks = () => {
    setProcessing(true);
    setProgress(0);
    setProcessedNumbers([]);
    const startTime = performance.now();
    const results = new Array(numbers.length);
    const chunkSize = 500;
    let currentIndex = 0;

    const processChunk = () => {
      if (currentIndex >= numbers.length) {
        setProcessing(false);
        setTimeTaken((prev) => ({
          ...prev,
          chunked: performance.now() - startTime,
        }));
        return;
      }

      const end = Math.min(currentIndex + chunkSize, numbers.length);

      // Process current chunk
      for (let i = currentIndex; i < end; i++) {
        results[i] = expensiveOperation(numbers[i]);
      }

      // Update state with the processed results so far
      setProcessedNumbers([...results]);

      // Update progress percentage
      const progressPercent = Math.round((end / numbers.length) * 100);
      setProgress(progressPercent);

      // Schedule next chunk with setTimeout to yield to UI
      currentIndex += chunkSize;
      setTimeout(processChunk, 0);
    };

    // Start processing the first chunk
    setTimeout(processChunk, 100);
  };

  // Track UI responsiveness
  useEffect(() => {
    const interval = setInterval(() => {
      setUiResponsiveness((prev) => ({
        count: prev.count + 1,
        lastUpdated: Date.now(),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Decide which processing method to use
  const startProcessing = () => {
    if (method === "single") {
      processAllAtOnce();
    } else {
      processInChunks();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Chunked Processing Demo</h1>

      <div className="mb-6">
        <p className="mb-2">
          This demo shows how breaking a long task into smaller chunks improves
          UI responsiveness at the cost of slightly longer total processing
          time.
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Single Task: Process everything at once (blocks UI)</li>
          <li>
            Chunked Processing: Split work into small chunks with UI updates
            between
          </li>
        </ul>
      </div>

      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={generateNumbers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={processing}
          >
            Generate 100K Numbers
          </button>

          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="single"
                checked={method === "single"}
                onChange={() => setMethod("single")}
                disabled={processing}
                className="mr-2"
              />
              Single Task
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                value="chunked"
                checked={method === "chunked"}
                onChange={() => setMethod("chunked")}
                disabled={processing}
                className="mr-2"
              />
              Chunked Processing
            </label>
          </div>
        </div>

        <button
          onClick={startProcessing}
          disabled={processing || numbers.length === 0}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {processing ? "Processing..." : "Start Processing"}
        </button>
      </div>

      {numbers.length > 0 && (
        <div className="mb-6">
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>Progress:</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Responsiveness Test</h3>
              <p>Click and drag this box while processing</p>
              <div className="bg-gray-100 p-4 rounded mt-2 text-sm">
                Counter updates: {uiResponsiveness.count}
                <br />
                Last updated:{" "}
                {new Date(uiResponsiveness.lastUpdated).toLocaleTimeString()}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Processing Time</h3>
              <div>
                <p>
                  Single task:{" "}
                  {timeTaken.single
                    ? `${timeTaken.single.toFixed(2)}ms`
                    : "Not run yet"}
                </p>
                <p>
                  Chunked processing:{" "}
                  {timeTaken.chunked
                    ? `${timeTaken.chunked.toFixed(2)}ms`
                    : "Not run yet"}
                </p>

                {timeTaken.single && timeTaken.chunked && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="font-semibold">
                      Chunked processing took
                      {timeTaken.chunked > timeTaken.single
                        ? " longer "
                        : " shorter "}
                      by{" "}
                      {Math.abs(timeTaken.chunked - timeTaken.single).toFixed(
                        2
                      )}
                      ms (
                      {(
                        (Math.abs(timeTaken.chunked - timeTaken.single) /
                          timeTaken.single) *
                        100
                      ).toFixed(2)}
                      %)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Results Preview (first 5 items):</h3>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          {processedNumbers.length > 0
            ? JSON.stringify(processedNumbers.slice(0, 5), null, 2)
            : "No results yet"}
        </pre>
      </div>
    </div>
  );
};

export default ChunkedProcessingDemo;
