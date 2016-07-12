/**
 * mSupply MobileAndroid
 * Sustainable Solutions (NZ) Ltd. 2016
 */

export class Scheduler {
  constructor() {
    this.intervalIds = [];
  }

  schedule(onInterval, interval) {
    const intervalId = setInterval(onInterval, interval);
    this.intervalIds = [...this.intervalIds, intervalId];
  }

  clearAll() {
    for (const intervalId of this.intervalIds) {
      clearInterval(intervalId);
    }
    this.intervalIds = [];
  }
}
