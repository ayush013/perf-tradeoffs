export const initPerfObserver = () => {
  new PerformanceObserver((entries) => {
    for (const entry of entries.getEntries()) {
      if (entry.interactionId > 0) {
        console.log(`Interaction latency:`, entry.duration, entry.name);
      }
    }
  }).observe({ type: "event", durationThreshold: 0 });
};
