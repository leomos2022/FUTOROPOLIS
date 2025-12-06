import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import SensorManager from './components/IoT/SensorManager';
import HUD from './components/UI/HUD';
import EducationalPanel from './components/UI/EducationalPanel';
import SensorPanel from './components/UI/SensorPanel';

import './styles/main.css';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sensorManagerRef = useRef<SensorManager | null>(null);
  
  const characterRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const velocityRef = useRef({ x: 0, z: 0 });
  const keysPressed = useRef<Set<string>>(new Set());
  const cameraMode = useRef<'free' | 'follow'>('follow');
  const mouseDownRef = useRef(false);
  const mouseTargetRef = useRef<{ x: number, z: number } | null>(null);
  
  const [cityGenerated, setCityGenerated] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<{id: string, type: string} | null>(null);

  // Función para crear carro realista
  const createRealisticCar = (color: number): THREE.Group => {
    const carGroup = new THREE.Group();
    
    // Carrocería principal
    const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.8,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = false; // Deshabilitar para rendimiento
    carGroup.add(body);
    
    // Cabina
    const cabinGeometry = new THREE.BoxGeometry(1.6, 0.6, 2);
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.7,
      roughness: 0.3
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 1.1, -0.3);
    cabin.castShadow = false; // Deshabilitar para rendimiento
    carGroup.add(cabin);
    
    // Ventanas
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7
    });
    
    const windowGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.8);
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(0, 1.15, -0.3);
    carGroup.add(window1);
    
    // Ruedas
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 8);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.5,
      roughness: 0.7
    });
    
    const wheelPositions = [
      { x: -0.9, z: 1.2 },
      { x: 0.9, z: 1.2 },
      { x: -0.9, z: -1.2 },
      { x: 0.9, z: -1.2 }
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.3, pos.z);
      wheel.castShadow = false; // Deshabilitar para rendimiento
      carGroup.add(wheel);
    });
    
    // Faros delanteros
    const lightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffffaa,
      emissiveIntensity: 0.8
    });
    
    const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
    leftLight.position.set(-0.6, 0.6, 2.1);
    carGroup.add(leftLight);
    
    const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
    rightLight.position.set(0.6, 0.6, 2.1);
    carGroup.add(rightLight);
    
    return carGroup;
  };

  // Función para crear persona realista
  const createRealisticPerson = (): THREE.Group => {
    const personGroup = new THREE.Group();
    
    // Piernas
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.9, 6);
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      roughness: 0.8
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, skinMaterial);
    leftLeg.position.set(-0.15, 0.45, 0);
    leftLeg.castShadow = false; // Optimización
    personGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, skinMaterial);
    rightLeg.position.set(0.15, 0.45, 0);
    rightLeg.castShadow = false; // Optimización
    personGroup.add(rightLeg);
    
    // Torso
    const torsoGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.3);
    const shirtColors = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6];
    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: shirtColors[Math.floor(Math.random() * shirtColors.length)],
      roughness: 0.7
    });
    const torso = new THREE.Mesh(torsoGeometry, shirtMaterial);
    torso.position.set(0, 1.25, 0);
    torso.castShadow = false; // Optimización
    personGroup.add(torso);
    
    // Brazos
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6);
    
    const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftArm.position.set(-0.35, 1.2, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.castShadow = false; // Optimización
    personGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightArm.position.set(0.35, 1.2, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.castShadow = false; // Optimización
    personGroup.add(rightArm);
    
    // Cabeza
    const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.set(0, 1.8, 0);
    head.castShadow = false; // Optimización
    personGroup.add(head);
    
    // Cabello
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: [0x2c1810, 0x8b4513, 0xffd700, 0x111111][Math.floor(Math.random() * 4)],
      roughness: 0.9
    });
    const hairGeometry = new THREE.SphereGeometry(0.22, 8, 8);
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.set(0, 1.9, 0);
    hair.scale.set(1, 0.8, 1);
    hair.castShadow = false; // Optimización
    personGroup.add(hair);
    
    return personGroup;
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('🌆 Iniciando FUTURÓPOLIS - Ciudad Inteligente IoT 3D');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 300);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 80);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reducir para mejor rendimiento
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap; // Más rápido que PCFSoft
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 2.2;
    controlsRef.current = controls;

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 80, 40);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.mapSize.width = 1024; // Reducir de 2048 para mejor rendimiento
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // CIUDAD
    const blockSize = 40;
    const numBlocks = 8;
    const citySize = blockSize * numBlocks;

    // Suelo
    const groundGeometry = new THREE.PlaneGeometry(400, 400);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a7c3a,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Calles
    const roadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.9
    });

    for (let i = 0; i <= numBlocks; i++) {
      const pos = -citySize/2 + i * blockSize;
      
      const roadH = new THREE.Mesh(
        new THREE.PlaneGeometry(citySize, 8),
        roadMaterial
      );
      roadH.rotation.x = -Math.PI / 2;
      roadH.position.set(0, 0.01, pos);
      roadH.receiveShadow = true;
      scene.add(roadH);

      const lineH = new THREE.Mesh(
        new THREE.PlaneGeometry(citySize, 0.3),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      lineH.rotation.x = -Math.PI / 2;
      lineH.position.set(0, 0.02, pos);
      scene.add(lineH);

      const roadV = new THREE.Mesh(
        new THREE.PlaneGeometry(8, citySize),
        roadMaterial
      );
      roadV.rotation.x = -Math.PI / 2;
      roadV.position.set(pos, 0.01, 0);
      roadV.receiveShadow = true;
      scene.add(roadV);

      const lineV = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, citySize),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      lineV.rotation.x = -Math.PI / 2;
      lineV.position.set(pos, 0.02, 0);
      scene.add(lineV);
    }

    // Edificios
    const buildingTypes = [
      { color: 0x87CEEB, minHeight: 15, maxHeight: 30 },
      { color: 0xFFD700, minHeight: 25, maxHeight: 50 },
      { color: 0xA9A9A9, minHeight: 12, maxHeight: 25 },
      { color: 0xFF6B6B, minHeight: 30, maxHeight: 60 },
      { color: 0x4ECDC4, minHeight: 15, maxHeight: 35 }
    ];

    for (let bx = 0; bx < numBlocks; bx++) {
      for (let bz = 0; bz < numBlocks; bz++) {
        const blockX = -citySize/2 + bx * blockSize + blockSize/2;
        const blockZ = -citySize/2 + bz * blockSize + blockSize/2;
        
        const numBuildings = 1 + Math.floor(Math.random() * 2); // Menos edificios para velocidad
        
        for (let b = 0; b < numBuildings; b++) {
          const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
          
          const width = 6 + Math.random() * 10;
          const depth = 6 + Math.random() * 10;
          const height = type.minHeight + Math.random() * (type.maxHeight - type.minHeight);
          
          const offsetX = (Math.random() - 0.5) * (blockSize - width - 10);
          const offsetZ = (Math.random() - 0.5) * (blockSize - depth - 10);
          
          const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
          const buildingMaterial = new THREE.MeshStandardMaterial({ 
            color: type.color,
            roughness: 0.7,
            metalness: 0.3
          });
          
          const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
          building.position.set(blockX + offsetX, height / 2, blockZ + offsetZ);
          building.castShadow = true;
          building.receiveShadow = true;
          scene.add(building);
          
          // Ventanas
          const windowsGeometry = new THREE.BoxGeometry(width * 0.95, height * 0.9, depth * 0.95);
          const windowsMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffeb3b,
            emissive: 0xffeb3b,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.6
          });
          
          const windows = new THREE.Mesh(windowsGeometry, windowsMaterial);
          windows.position.copy(building.position);
          scene.add(windows);
        }
      }
    }

    // Árboles (reducidos para mejor rendimiento)
    for (let i = 0; i < 80; i++) {
      const x = (Math.random() - 0.5) * citySize * 0.9;
      const z = (Math.random() - 0.5) * citySize * 0.9;
      
      const nearRoadX = Math.abs(x % blockSize) < 6;
      const nearRoadZ = Math.abs(z % blockSize) < 6;
      if (nearRoadX || nearRoadZ) continue;
      
      const treeGroup = new THREE.Group();
      
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.6, 4, 6),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      );
      trunk.position.y = 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);
      
      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x228B22 })
      );
      leaves.position.y = 5;
      leaves.castShadow = false; // Deshabilitar sombras en hojas para rendimiento
      treeGroup.add(leaves);
      
      treeGroup.position.set(x, 0, z);
      scene.add(treeGroup);
    }

    // Carros realistas (reducidos para mejor rendimiento)
    const vehicles: { mesh: THREE.Group; velocity: number; isHorizontal: boolean }[] = [];
    const carColors = [0xFF0000, 0x0000FF, 0x00FF00, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xffffff, 0x000000];
    
    for (let i = 0; i < 25; i++) {
      const lane = Math.floor(Math.random() * numBlocks);
      const isHorizontal = Math.random() > 0.5;
      
      const car = createRealisticCar(carColors[Math.floor(Math.random() * carColors.length)]);
      
      if (isHorizontal) {
        // Carros que van en dirección X (horizontalmente)
        car.position.set(
          (Math.random() - 0.5) * citySize * 0.8,
          0,
          -citySize/2 + lane * blockSize
        );
        car.rotation.y = Math.PI / 2; // Rotar 90 grados para que miren en dirección X
      } else {
        // Carros que van en dirección Z (verticalmente)
        car.position.set(
          -citySize/2 + lane * blockSize,
          0,
          (Math.random() - 0.5) * citySize * 0.8
        );
        // Sin rotación, por defecto miran en dirección Z
      }
      
      scene.add(car);
      vehicles.push({
        mesh: car,
        velocity: 0.3 + Math.random() * 0.5,
        isHorizontal: isHorizontal
      });
    }

    // Personas realistas (optimizadas)
    const people: { mesh: THREE.Group; walkSpeed: number; direction: THREE.Vector3 }[] = [];
    
    for (let i = 0; i < 20; i++) { // Reducir para mejor velocidad
      const person = createRealisticPerson();
      const x = (Math.random() - 0.5) * citySize * 0.9;
      const z = (Math.random() - 0.5) * citySize * 0.9;
      
      person.position.set(x, 0, z);
      person.rotation.y = Math.random() * Math.PI * 2;
      scene.add(person);
      
      people.push({
        mesh: person,
        walkSpeed: 0.2 + Math.random() * 0.3,
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          0,
          (Math.random() - 0.5) * 2
        ).normalize()
      });
    }

    // Farolas (solo en esquinas para mejor rendimiento)
    for (let i = 0; i <= numBlocks; i += 2) {
      for (let j = 0; j <= numBlocks; j += 2) {
        const x = -citySize/2 + i * blockSize;
        const z = -citySize/2 + j * blockSize;
        
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 5, 6),
          new THREE.MeshStandardMaterial({ color: 0x404040 })
        );
        pole.position.set(x + 3, 2.5, z + 3);
        pole.castShadow = true;
        scene.add(pole);
        
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 6, 6),
          new THREE.MeshStandardMaterial({ 
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 1
          })
        );
        lamp.position.set(x + 3, 5, z + 3);
        scene.add(lamp);
        
        const light = new THREE.PointLight(0xffaa00, 0.5, 20);
        light.position.set(x + 3, 5, z + 3);
        scene.add(light);
      }
    }

    // Personaje jugador (TÚ - humano detallado)
    const character = new THREE.Group();
    
    // Piernas
    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.9, 6),
      new THREE.MeshStandardMaterial({ color: 0x2c5aa0 }) // Pantalón azul
    );
    leftLeg.position.set(-0.2, 0.45, 0);
    leftLeg.castShadow = true;
    character.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.9, 6),
      new THREE.MeshStandardMaterial({ color: 0x2c5aa0 })
    );
    rightLeg.position.set(0.2, 0.45, 0);
    rightLeg.castShadow = true;
    character.add(rightLeg);
    
    // Torso
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.8, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xff6b6b }) // Camisa roja
    );
    torso.position.y = 1.3;
    torso.castShadow = true;
    character.add(torso);
    
    // Brazos
    const leftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.7, 6),
      new THREE.MeshStandardMaterial({ color: 0xffdbac }) // Piel
    );
    leftArm.position.set(-0.4, 1.25, 0);
    leftArm.rotation.z = Math.PI / 8;
    leftArm.castShadow = true;
    character.add(leftArm);
    
    const rightArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.7, 6),
      new THREE.MeshStandardMaterial({ color: 0xffdbac })
    );
    rightArm.position.set(0.4, 1.25, 0);
    rightArm.rotation.z = -Math.PI / 8;
    rightArm.castShadow = true;
    character.add(rightArm);
    
    // Cabeza
    const playerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffdbac })
    );
    playerHead.position.y = 2;
    playerHead.castShadow = true;
    character.add(playerHead);
    
    // Cabello
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x2c1810 }) // Cabello oscuro
    );
    hair.position.y = 2.1;
    hair.scale.set(1, 0.8, 1);
    hair.castShadow = true;
    character.add(hair);
    
    // Flecha direccional
    const directionArrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.6, 8),
      new THREE.MeshBasicMaterial({ color: 0xffff00 }) // Amarillo brillante
    );
    directionArrow.rotation.x = Math.PI / 2;
    directionArrow.position.set(0, 1.8, 0.6);
    character.add(directionArrow);
    
    character.position.set(0, 0, 0);
    scene.add(character);
    characterRef.current = character;

    // Sistema IoT
    const sensorManager = new SensorManager(scene);
    sensorManagerRef.current = sensorManager;

    setCityGenerated(true);
    console.log('🎉 Ciudad lista con modelos realistas');

    // Sistema de clic en sensores (Raycasting)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      // Solo clic izquierdo para sensores
      if (event.button !== 0) return;
      
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      if (sensorManagerRef.current) {
        const sensorMeshes = scene.children.filter(
          child => child instanceof THREE.Mesh && child.userData.type === 'sensor'
        ) as THREE.Mesh[];
        
        const intersects = raycaster.intersectObjects(sensorMeshes);
        
        if (intersects.length > 0) {
          const clickedSensor = intersects[0].object;
          const sensorId = clickedSensor.userData.id;
          const sensorType = clickedSensor.userData.sensorType || 'Desconocido';
          console.log(`🎯 Sensor clicado: ${sensorId} - Tipo: ${sensorType}`);
          setSelectedSensor({ id: sensorId, type: sensorType });
          
          // Efecto visual al hacer clic
          const originalScale = clickedSensor.scale.clone();
          clickedSensor.scale.set(2, 2, 2);
          setTimeout(() => {
            clickedSensor.scale.copy(originalScale);
          }, 200);
        }
      }
    };

    // Controles de teclado (Flechas)
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      keysPressed.current.add(key);
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        cameraMode.current = 'follow';
        console.log('🎮 Moviendo personaje...');
      }
      
      if (key.toLowerCase() === 'c') {
        cameraMode.current = cameraMode.current === 'follow' ? 'free' : 'follow';
        console.log(`📷 Modo: ${cameraMode.current === 'follow' ? 'SEGUIR' : 'LIBRE'}`);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key);
    };

    // Movimiento con clic derecho del mouse
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 2) { // Clic derecho
        event.preventDefault();
        mouseDownRef.current = true;
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        // Raycast al suelo
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, intersectPoint);
        
        if (intersectPoint) {
          mouseTargetRef.current = { x: intersectPoint.x, z: intersectPoint.z };
          cameraMode.current = 'follow';
          console.log(`🖱️ Moviendo a: (${intersectPoint.x.toFixed(1)}, ${intersectPoint.z.toFixed(1)})`);
        }
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        mouseDownRef.current = false;
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault(); // Deshabilitar menú contextual
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Animación
    let lastTime = performance.now();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      
      if (cameraMode.current === 'free') {
        controls.update();
      }
      
      // Movimiento del personaje
      if (characterRef.current) {
        const isRunning = keysPressed.current.has('shift');
        const baseSpeed = isRunning ? 20 : 12;
        const targetVelocity = { x: 0, z: 0 };
        
        // Movimiento con mouse (clic derecho)
        if (mouseTargetRef.current) {
          const dx = mouseTargetRef.current.x - characterRef.current.position.x;
          const dz = mouseTargetRef.current.z - characterRef.current.position.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          if (distance > 1) {
            const mouseSpeed = isRunning ? 20 : 12;
            targetVelocity.x = (dx / distance) * mouseSpeed;
            targetVelocity.z = (dz / distance) * mouseSpeed;
          } else {
            mouseTargetRef.current = null; // Llegamos al destino
          }
        }
        
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        
        // Movimiento con teclado - Flechas (cancela movimiento con mouse)
        if (keysPressed.current.has('ArrowUp')) {
          mouseTargetRef.current = null;
          targetVelocity.x -= cameraDirection.x * baseSpeed;
          targetVelocity.z -= cameraDirection.z * baseSpeed;
        }
        if (keysPressed.current.has('ArrowDown')) {
          mouseTargetRef.current = null;
          targetVelocity.x += cameraDirection.x * baseSpeed;
          targetVelocity.z += cameraDirection.z * baseSpeed;
        }
        if (keysPressed.current.has('ArrowLeft')) {
          mouseTargetRef.current = null;
          targetVelocity.x -= cameraRight.x * baseSpeed;
          targetVelocity.z -= cameraRight.z * baseSpeed;
        }
        if (keysPressed.current.has('ArrowRight')) {
          mouseTargetRef.current = null;
          targetVelocity.x += cameraRight.x * baseSpeed;
          targetVelocity.z += cameraRight.z * baseSpeed;
        }
        
        const isMoving = Math.abs(targetVelocity.x) > 0.1 || Math.abs(targetVelocity.z) > 0.1;
        const smoothing = isMoving ? 0.15 : 0.08;
        
        velocityRef.current.x += (targetVelocity.x - velocityRef.current.x) * smoothing;
        velocityRef.current.z += (targetVelocity.z - velocityRef.current.z) * smoothing;
        
        characterRef.current.position.x += velocityRef.current.x * deltaTime;
        characterRef.current.position.z += velocityRef.current.z * deltaTime;
        
        const maxPos = citySize / 2 - 5;
        characterRef.current.position.x = Math.max(-maxPos, Math.min(maxPos, characterRef.current.position.x));
        characterRef.current.position.z = Math.max(-maxPos, Math.min(maxPos, characterRef.current.position.z));
        
        if (isMoving) {
          const targetAngle = Math.atan2(velocityRef.current.x, velocityRef.current.z);
          const currentAngle = characterRef.current.rotation.y;
          let angleDiff = targetAngle - currentAngle;
          
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          
          characterRef.current.rotation.y += angleDiff * 0.15;
          
          const bobSpeed = isRunning ? 12 : 8;
          const bobAmount = isRunning ? 0.3 : 0.2;
          characterRef.current.position.y = Math.abs(Math.sin(Date.now() * 0.001 * bobSpeed)) * bobAmount;
        }
        
        if (cameraMode.current === 'follow') {
          const distance = isRunning ? 25 : 20;
          const height = isRunning ? 12 : 10;
          
          const cameraOffset = new THREE.Vector3(0, height, distance);
          cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRef.current.rotation.y);
          
          const targetCameraPos = characterRef.current.position.clone().add(cameraOffset);
          camera.position.lerp(targetCameraPos, 0.08);
          
          const lookAtPos = characterRef.current.position.clone();
          lookAtPos.y += 2;
          
          const currentTarget = controls.target.clone();
          controls.target.copy(currentTarget.lerp(lookAtPos, 0.1));
          controls.update();
        }
      }
      
      // Animar vehículos (corregido para que vayan en la dirección correcta)
      vehicles.forEach(vehicle => {
        if (vehicle.isHorizontal) {
          // Carros horizontales se mueven en el eje X
          vehicle.mesh.position.x += vehicle.velocity;
          if (vehicle.mesh.position.x > citySize/2) {
            vehicle.mesh.position.x = -citySize/2;
          }
        } else {
          // Carros verticales se mueven en el eje Z
          vehicle.mesh.position.z += vehicle.velocity;
          if (vehicle.mesh.position.z > citySize/2) {
            vehicle.mesh.position.z = -citySize/2;
          }
        }
      });
      
      // Animar personas caminando
      people.forEach(person => {
        person.mesh.position.x += person.direction.x * person.walkSpeed * deltaTime;
        person.mesh.position.z += person.direction.z * person.walkSpeed * deltaTime;
        
        // Límites y cambio de dirección
        if (Math.abs(person.mesh.position.x) > citySize/2 - 10 || 
            Math.abs(person.mesh.position.z) > citySize/2 - 10) {
          person.direction.multiplyScalar(-1);
          person.mesh.rotation.y += Math.PI;
        }
        
        // Animación de caminata
        const time = Date.now() * 0.001;
        person.mesh.position.y = Math.abs(Math.sin(time * person.walkSpeed * 10)) * 0.1;
      });
      
      if (sensorManager) {
        sensorManager.update(deltaTime);
      }
      
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);
    
    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('click', onMouseClick);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
      
      if (sensorManagerRef.current) {
        sensorManagerRef.current.dispose();
      }
      
      renderer.dispose();
    };
  }, []);

  return (
    <div className="app-container">
      <canvas ref={canvasRef} className="city-canvas" />
      {cityGenerated && (
        <>
          <HUD />
          <EducationalPanel />
          <SensorPanel />
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '15px',
            fontFamily: 'monospace',
            textAlign: 'center',
            zIndex: 1000,
            border: '2px solid rgba(0,255,0,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '15px' }}>
              🎮 <strong>CONTROLES INTUITIVOS</strong>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'left' }}>
              <div><strong>⬆️ ⬇️ ⬅️ ➡️ FLECHAS</strong> - Mover personaje</div>
              <div><strong>CLIC DERECHO</strong> - Mover a posición 🖱️</div>
              <div><strong>SHIFT</strong> - Mantener para correr 🏃</div>
              <div><strong>C</strong> - Cambiar cámara libre/seguir</div>
            </div>
            <div style={{ fontSize: '12px', marginTop: '10px', color: '#00ff00' }}>
              💡 Usa las flechas del teclado para moverte
            </div>
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#ffff00' }}>
              🟢 Clic en sensores de colores para ver info
            </div>
          </div>
          
          {selectedSensor && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.95)',
              color: 'white',
              padding: '30px',
              borderRadius: '20px',
              border: '3px solid #00ff00',
              boxShadow: '0 0 30px rgba(0, 255, 0, 0.5)',
              zIndex: 2000,
              minWidth: '400px',
              fontFamily: 'monospace'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '15px', color: '#00ff00' }}>
                🔬 <strong>SENSOR IoT: {selectedSensor.type.toUpperCase()}</strong>
              </div>
              <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
                <div><strong>ID:</strong> {selectedSensor.id}</div>
                <div><strong>Estado:</strong> ✅ Operativo</div>
                <div><strong>Tipo:</strong> {selectedSensor.type}</div>
                <div><strong>Ubicación:</strong> Smart City Grid</div>
                <div style={{ marginTop: '15px' }}><strong>Datos en Tiempo Real:</strong></div>
                <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                  {selectedSensor.type === 'Tráfico' && (
                    <>
                      <li>🚗 Flujo vehicular: {(50 + Math.random() * 100).toFixed(0)} veh/hora</li>
                      <li>⏱️ Tiempo promedio: {(3 + Math.random() * 5).toFixed(1)} min</li>
                      <li>🚦 Congestión: {Math.random() > 0.5 ? 'Baja' : 'Media'}</li>
                    </>
                  )}
                  {selectedSensor.type === 'Iluminación' && (
                    <>
                      <li>💡 Intensidad: {(40 + Math.random() * 60).toFixed(0)}%</li>
                      <li>⚡ Consumo: {(0.5 + Math.random() * 1.5).toFixed(2)} kW</li>
                      <li>🌙 Modo nocturno: {Math.random() > 0.5 ? 'Activo' : 'Inactivo'}</li>
                    </>
                  )}
                  {selectedSensor.type === 'Calidad Aire' && (
                    <>
                      <li>🌫️ PM2.5: {(10 + Math.random() * 30).toFixed(1)} µg/m³</li>
                      <li>🌬️ CO2: {(300 + Math.random() * 100).toFixed(0)} ppm</li>
                      <li>✅ Calidad: {Math.random() > 0.5 ? 'Buena' : 'Excelente'}</li>
                    </>
                  )}
                  {selectedSensor.type === 'Temperatura' && (
                    <>
                      <li>🌡️ Temperatura: {(18 + Math.random() * 12).toFixed(1)}°C</li>
                      <li>💧 Humedad: {(40 + Math.random() * 40).toFixed(0)}%</li>
                      <li>☁️ Presión: {(1010 + Math.random() * 20).toFixed(0)} hPa</li>
                    </>
                  )}
                  {selectedSensor.type === 'Residuos' && (
                    <>
                      <li>🗑️ Nivel llenado: {(20 + Math.random() * 70).toFixed(0)}%</li>
                      <li>♻️ Reciclaje: {(30 + Math.random() * 40).toFixed(0)}%</li>
                      <li>📦 Próxima recolección: {Math.floor(Math.random() * 24)}h</li>
                    </>
                  )}
                  {selectedSensor.type === 'Seguridad' && (
                    <>
                      <li>📹 Cámaras activas: {Math.floor(2 + Math.random() * 4)}</li>
                      <li>🚪 Accesos monitoreados: {Math.floor(5 + Math.random() * 10)}</li>
                      <li>✅ Estado: {Math.random() > 0.5 ? 'Normal' : 'Seguro'}</li>
                    </>
                  )}
                </ul>
              </div>
              <button
                onClick={() => setSelectedSensor(null)}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: '#00ff00',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              >
                CERRAR
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
