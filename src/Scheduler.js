/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

export default class Scheduler {
  constructor() {
    this.intervalIds = [];
  }

  schedule(onInterval, interval) {
    const intervalId = setInterval(onInterval, interval);
    this.intervalIds = [...this.intervalIds, intervalId];
  }

  clearAll() {
    for (let intervalId of this.intervalIds) {
      clearInterval(intervalId);
    }
    this.intervalIds = [];
  }
}
