import React, { useState, useEffect } from "react";

const ChunkedProcessingDemo = () => {
  const [numbers, setNumbers] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState("chunked");
  const [progress, setProgress] = useState(0);
  const [timeTaken, setTimeTaken] = useState({ single: null, chunked: null });
  // Generate a large array of numbers for processing
  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 100000; i++) {
      arr.push(i);
    }
    setNumbers(arr);
    setProgress(0);
    setTimeTaken({ single: null, chunked: null });
  }, []);

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
      numbers.map(expensiveOperation);
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
    const startTime = performance.now();
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
        expensiveOperation(numbers[i]);
      }

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

  // Decide which processing method to use
  const startProcessing = () => {
    if (method === "single") {
      processAllAtOnce();
    } else {
      processInChunks();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto rounded-lg shadow-md">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-4">
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

          <button
            onClick={startProcessing}
            disabled={processing || numbers.length === 0}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:bg-gray-400 cursor-pointer"
          >
            {processing ? "Processing..." : "Start Processing"}
          </button>
        </div>
      </div>

      {numbers.length > 0 && (
        <div className="mb-6">
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>Progress:</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 border rounded-lg mt-6 border-gray-600">
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
                <div className="mt-2 p-2 rounded border border-yellow-200">
                  <p className="font-semibold">
                    Chunked processing took
                    {timeTaken.chunked > timeTaken.single
                      ? " longer "
                      : " shorter "}
                    by{" "}
                    {Math.abs(timeTaken.chunked - timeTaken.single).toFixed(2)}
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
      )}
    </div>
  );
};

export default ChunkedProcessingDemo;
