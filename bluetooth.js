class BluetoothButtonManager {
  constructor(playerLabel, onPoint, onUndo) {
    this.playerLabel = playerLabel; // "A" oder "B"
    this.onPoint = onPoint; // Callback bei Punkt
    this.onUndo = onUndo;   // Callback bei Rückgängig
    this.device = null;
    this.characteristic = null;
  }
  
  async connect() {
    try {
      // Filter je nach Gerät/Service UUID anpassen
      this.device = await navigator.bluetooth.requestDevice({
        // acceptAllDevices: true,  // ggf. breiter, oder filter auf bekannte UUIDs
        filters: [{services: ['battery_service']}] // Beispiel Service - anpassen!
      });
      this.device.addEventListener('gattserverdisconnected', () => {
        console.log(`${this.playerLabel} Bluetooth Gerät getrennt`);
        this.device = null;
        this.characteristic = null;
      });
      const server = await this.device.gatt.connect();
      const service = await server.getPrimaryService('battery_service'); // Beispielservice
      this.characteristic = await service.getCharacteristic('battery_level'); // Beispielcharakteristik
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged',
        this.handleButtonEvent.bind(this));
      console.log(`${this.playerLabel} Bluetooth Gerät verbunden`);
    } catch (error) {
      console.error(`${this.playerLabel} Bluetooth Fehler: `, error);
    }
  }
  
  handleButtonEvent(event) {
    const value = event.target.value.getUint8(0);
    if (value === 1) {
      // Einmal Tasten-Event → Punkt erhöhen
      this.onPoint(this.playerLabel);
    } else if (value === 2) {
      // Zweimal Tipp → Undo
      this.onUndo(this.playerLabel);
    }
  }
}
