export default class Timer {

  private history: number[] = [];
  private startTime: number | null = null;
  public sampleSize: number;

  start (sampleSize = 40) {
    this.sampleSize = sampleSize;
    this.startTime = Date.now();
  }

  stop () {

    const stopTime = Date.now();

    if (this.startTime === null) {
      throw new Error('use Timer.start before, and Time.stop after the code to be measured');
    }

    this.history.push(stopTime - this.startTime);

    if (this.history.length > this.sampleSize) {
      this.history.shift();
    }

    this.startTime = null;

  }

  get time () {
    return this.history.reduce((a, b) => a + b, 0) / this.history.length;
  }

}