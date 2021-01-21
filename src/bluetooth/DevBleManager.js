const randomMacs = [
  'AA:BB:CC:DD:EE:FF',
  '12:34:56:78:09:10',
  'AB:CD:EF:GH:IJ:KL',
  'TH:IS:IS:TO:TE:SA',
  'RE:AL:MA:CO:MG:AA',
  'HE:HE:WO:ND:ER:IF',
  'AN:YO:NE:WI:LL:NO',
  'TI:CE:TH:IS:JO:KE',
];

const COMMAND_TO_RESULT_LOOKUP = {
  // *logall
  'KmxvZ2FsbA==': callback => {
    callback(null, { value: 'ABEAEQARAAIBAAAAAAA6' });
    callback(null, { value: 'ARcBFwEXARcBFwEXARcBFwEXARc=' });
    callback(null, { value: 'ARcBFwEXARYBFgEWARguAAAAAAA=' });
    callback(null, null);
  },
  // *blink
  KmJsaW5r: callback => {
    callback(null, { value: 'T2sA' });
    callback(null, null);
  },
  // *info
  'KmluZm8=': callback => {
    callback(null, { value: 'U0VUVElOR1MAAAAAAAAAAAAAAAA=' });
    callback(null, { value: 'TmFtZTogICBFNzIyOTZERQAAAAA=' });
    callback(null, { value: 'VmVyIG5vOiAxMwAAAAAAAAAAAAA=' });
    callback(null, { value: 'U3ViIHZlciBubzogMTUuMC4wAAA=' });
    callback(null, { value: 'UmVsIGR0ZTogMjYgU2VwIDE5AAA=' });
    callback(null, { value: 'VHhwIGx2bDogNAAAAAAAAAAAAAA=' });
    callback(null, { value: 'QmF0dCBsdmw6IDEwMCUAAAAAAAA=' });
    callback(null, { value: 'TWVtIDgzMyBkYXlzAAAAAAAAAAA=' });
    callback(null, { value: 'QWR2IHdrZXVwOiBOL0EAAAAAAAA=' });
    callback(null, { value: 'VW5pdHM6IEMAAAAAAAAAAAAAAAA=' });
    callback(null, { value: 'TWVtOiAyMDAwMAAAAAAAAAAAAAA=' });
    callback(null, { value: 'QWlyIG1vZGUgb2ZmAAAAAAAAAAA=' });
    callback(null, { value: 'UnVuIGFwcHggMTZocnMAAAAAAAA=' });
    callback(null, { value: 'RGF0ZSB5eW1tZGRoaG1tOgAAAAA=' });
    callback(null, { value: 'LT4gMDA6MDA6MDA6MDA6MDAAAAA=' });
    callback(null, { value: 'SWQ6IDI1NQAAAAAAAAAAAAAAAAA=' });
    callback(null, { value: 'QnRuIG9uL29mZjogMQAAAAAAAAA=' });
    callback(null, { value: 'VGVtcCBDYWwuIDAAAAAAAAAAAAA=' });
    callback(null, { value: 'SHVtIENhbHgxMCAwJQAAAAAAAAA=' });
    callback(null, null);
  },
  // *bd
  KmJk: callback => {
    callback(null, { value: 'T2sA' });
    callback(null, null);
  },
  // *lint300
  'KmxpbnQzMDA=': callback => {
    callback(null, { value: 'SW50ZXJ2YWw6IDYwcwAAAAAAAAA=' });
    callback(null, null);
  },
};
export class DevBleManager {
  constructor() {
    this.connectedDevices = {};
    this.isScanning = false;
    this.scannerInterval = null;
  }

  async connectToDevice(macAddress) {
    this.connectedDevices[macAddress] = { device: { id: macAddress } };
    return { id: macAddress };
  }

  async isDeviceConnected(macAddress) {
    return !!this.connectedDevices[macAddress];
  }

  async cancelDeviceConnection(macAddress) {
    this.connectedDevices[macAddress] = null;
  }

  async discoverAllServicesAndCharacteristicsForDevice(macAddress) {
    const connectedDevice = this.connectedDevices[macAddress];
    if (connectedDevice) {
      this.connectedDevices[macAddress].discoveredServices = true;
    } else {
      throw new Error("Trying to discover services of a device which isn't connected");
    }
  }

  async stopDeviceScan() {
    this.isScanning = false;
    clearInterval(this.scannerInterval);
  }

  async startDeviceScan(_, __, callback) {
    this.isScanning = true;

    setInterval(() => {
      const randomInt = Math.floor(Math.random() * randomMacs.length);
      callback(_, {
        id: randomMacs[randomInt],
        manufacturerData: 'MwEBDAN0AFkBtwEMA3QAWQG3AMwCrAAAAAAA',
      });
    }, 1000);
  }

  async writeCharacteristicWithoutResponseForDevice(macAddress, _, __, command) {
    const connectedDevice = this.connectedDevices[macAddress];
    const { callback } = this.connectedDevices[macAddress];
    if (connectedDevice && callback) {
      COMMAND_TO_RESULT_LOOKUP[command](callback);
      this.connectedDevices[macAddress] = null;
    } else {
      throw new Error("Trying to write to a device which isn't connected or isn't being monitored");
    }
  }

  async monitorCharacteristicForDevice(macAddress, _, __, callback) {
    const connectedDevice = this.connectedDevices[macAddress];
    if (connectedDevice) {
      this.connectedDevices[macAddress].callback = callback;
    } else {
      throw new Error("Trying to write to a device which isn't connected");
    }
  }
}
