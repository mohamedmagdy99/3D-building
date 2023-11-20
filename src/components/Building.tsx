import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Modal from "react-modal";

const Building: React.FC = () => {
  const buildingRef = useRef<HTMLDivElement>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    buildingRef.current!.appendChild(renderer.domElement);

    const floors: THREE.Mesh[] = [];

    for (let i = 0; i < 7; i++) {
      const geometry = new THREE.BoxGeometry(5, 1, 2);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const floor = new THREE.Mesh(geometry, material);

      floor.position.y = i * 2; // Adjust the vertical position of each floor
      floor.userData = { floorNumber: i + 1 }; // Store floor number in user data

      floors.push(floor);
      scene.add(floor);
    }

    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.z = 10;
    controls.enableDamping = true; // an animation loop is required when damping

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleFloorClick = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(floors);

      if (intersects.length > 0) {
        const selectedFloorNumber = intersects[0].object.userData.floorNumber;
        setSelectedFloor(selectedFloorNumber);
        setModalIsOpen(true);
      }
    };

    window.addEventListener("click", handleFloorClick);

    return () => {
      window.removeEventListener("click", handleFloorClick);
    };
  }, []);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div>
      <div ref={buildingRef} />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Floor Photo Modal"
      >
        <img src={require("./floor.png")} alt={`Floor ${selectedFloor}`} />
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default Building;
