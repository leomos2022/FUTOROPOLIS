import * as THREE from 'three';

export default class SensorManager {
  private scene: THREE.Scene;
  private sensors: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createSensors();
  }

  private createSensors(): void {
    // Crear sensores IoT distribuidos por la ciudad según requisitos del foro
    const sensorTypes = [
      { name: 'Tráfico', color: 0xff0000, positions: [
        { x: 60, z: 0 }, { x: -60, z: 0 }, { x: 0, z: 60 }, { x: 0, z: -60 },
        { x: 80, z: 40 }, { x: -80, z: 40 }, { x: 80, z: -40 }, { x: -80, z: -40 }
      ]},
      { name: 'Iluminación', color: 0xffff00, positions: [
        { x: 40, z: 40 }, { x: -40, z: 40 }, { x: 40, z: -40 }, { x: -40, z: -40 },
        { x: 100, z: 0 }, { x: -100, z: 0 }, { x: 0, z: 100 }, { x: 0, z: -100 }
      ]},
      { name: 'Calidad Aire', color: 0x00ffff, positions: [
        { x: 30, z: 30 }, { x: -30, z: 30 }, { x: 30, z: -30 }, { x: -30, z: -30 },
        { x: 70, z: 20 }, { x: -70, z: 20 }, { x: 20, z: 70 }, { x: -20, z: -70 }
      ]},
      { name: 'Temperatura', color: 0xff6600, positions: [
        { x: 50, z: 50 }, { x: -50, z: 50 }, { x: 50, z: -50 }, { x: -50, z: -50 },
        { x: 90, z: 0 }, { x: -90, z: 0 }
      ]},
      { name: 'Residuos', color: 0x00ff00, positions: [
        { x: 20, z: 60 }, { x: -20, z: 60 }, { x: 60, z: 20 }, { x: -60, z: 20 },
        { x: 20, z: -60 }, { x: -20, z: -60 }, { x: -60, z: -20 }, { x: 60, z: -20 }
      ]},
      { name: 'Seguridad', color: 0xff00ff, positions: [
        { x: 110, z: 30 }, { x: -110, z: 30 }, { x: 30, z: 110 }, { x: -30, z: -110 }
      ]}
    ];
    
    let sensorIndex = 0;
    sensorTypes.forEach(type => {
      type.positions.forEach(pos => {

        const sensorGeometry = new THREE.SphereGeometry(2, 8, 8);
        const sensorMaterial = new THREE.MeshStandardMaterial({
          color: type.color,
          emissive: type.color,
          emissiveIntensity: 0.6
        });

        const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
        sensor.position.set(pos.x, 4, pos.z);
        sensor.castShadow = true;
        sensor.userData = { 
          type: 'sensor', 
          id: `sensor-${sensorIndex}`,
          sensorType: type.name
        };

        this.scene.add(sensor);
        this.sensors.push(sensor);

        // Añadir luz al sensor
        const light = new THREE.PointLight(type.color, 1.5, 15);
        light.position.copy(sensor.position);
        this.scene.add(light);
        
        sensorIndex++;
      });
    });

    console.log(`✅ ${this.sensors.length} sensores IoT creados`);
  }

  update(deltaTime: number): void {
    // Animar sensores (pulsar y rotar)
    const time = Date.now() * 0.001;
    this.sensors.forEach((sensor, index) => {
      sensor.position.y = 4 + Math.sin(time * 2 + index) * 0.8;
      sensor.rotation.y += deltaTime * 2;
      sensor.rotation.x = Math.sin(time + index) * 0.2;
    });
  }

  dispose(): void {
    this.sensors.forEach(sensor => {
      sensor.geometry.dispose();
      if (sensor.material instanceof THREE.Material) {
        sensor.material.dispose();
      }
    });
  }
}
