jest.unmock('../Scheduler');
jest.unmock('sinon');

import { Scheduler } from '../Scheduler';
import sinon from 'sinon';

const MAX_INTERVAL = 100000;
const MIN_INTERVAL = 10;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

describe('Scheduler', () => {
  let callbackOne;
  let callbackTwo;
  let callbackThree;
  let intervalOne;
  let intervalTwo;
  let intervalThree;
  let scheduler;

  beforeEach(() => {
    callbackOne = sinon.spy();
    callbackTwo = sinon.spy();
    callbackThree = sinon.spy();
    scheduler = new Scheduler();
    intervalOne = getRandomInt(MIN_INTERVAL, MAX_INTERVAL);
    intervalTwo = getRandomInt(MIN_INTERVAL, MAX_INTERVAL);
    intervalThree = getRandomInt(MIN_INTERVAL, MAX_INTERVAL);
  });

  it('triggers the callback when scheduled', () => {
    scheduler.schedule(callbackOne, intervalOne);
    jest.runOnlyPendingTimers();
    expect(callbackOne.calledOnce).toBe(true);
  });

  it('triggers the callback multiple times', () => {
    scheduler.schedule(callbackOne, intervalOne);
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    expect(callbackOne.calledThrice).toBe(true);
  });

  it('stops triggering the callback after cleared', () => {
    scheduler.schedule(callbackOne, intervalOne);
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    scheduler.clearAll();
    jest.runOnlyPendingTimers();
    expect(callbackOne.calledTwice).toBe(true);
  });

  it('triggers multiple callbacks', () => {
    scheduler.schedule(callbackOne, intervalOne);
    scheduler.schedule(callbackTwo, intervalTwo);
    scheduler.schedule(callbackThree, intervalThree);
    jest.runOnlyPendingTimers();
    expect(callbackOne.calledOnce).toBe(true);
    expect(callbackTwo.calledOnce).toBe(true);
    expect(callbackThree.calledOnce).toBe(true);
  });

  it('triggers multiple callbacks multiple times', () => {
    scheduler.schedule(callbackOne, intervalOne);
    scheduler.schedule(callbackTwo, intervalTwo);
    scheduler.schedule(callbackThree, intervalThree);
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    expect(callbackOne.calledThrice).toBe(true);
    expect(callbackTwo.calledThrice).toBe(true);
    expect(callbackThree.calledThrice).toBe(true);
  });

  it('stops triggering all callbacks after cleared', () => {
    scheduler.schedule(callbackOne, intervalOne);
    scheduler.schedule(callbackTwo, intervalTwo);
    scheduler.schedule(callbackThree, intervalThree);
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    scheduler.clearAll();
    jest.runOnlyPendingTimers();
    expect(callbackOne.calledTwice).toBe(true);
    expect(callbackTwo.calledTwice).toBe(true);
    expect(callbackThree.calledTwice).toBe(true);
  });
});
