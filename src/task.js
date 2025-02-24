const sampleRunner = async function* () {
  yield console.log(1);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  yield console.log(2);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  yield console.log(3);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  yield console.log(4);
};

class Task {
  constructor(runnable) {
    this.runnable = runnable;
    this.controller = new AbortController();
    this.done = false;
  }

  abort = () => {
    this.controller.abort();
  };

  run = async () => {
    while (true) {
      if (this.done) {
        console.log("completed");
        return;
      }

      if (this.controller.signal.aborted) {
        console.log("aborted");
        return;
      }

      const result = await this.runnable.next();

      if (result.done) {
        console.log("done");
        this.done = true;
        return;
      }
    }
  };
}

const task = new Task(sampleRunner());

export { task };
