import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Modal from "react-modal";

const Building: React.FC = () => {
  const buildingRef = useRef<HTMLDivElement>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [pins, setPins] = useState<{ x: number; y: number; text: string }[]>(
    []
  );
  const [newPinText, setNewPinText] = useState<string>("");

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

      floor.position.y = i * 2;
      floor.userData = { floorNumber: i };

      floors.push(floor);
      scene.add(floor);
    }

    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.z = 10;
    controls.enableDamping = true;

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const makePinDraggable = (index: number) => (event: React.MouseEvent) => {
    event.preventDefault();

    const rect = buildingRef.current!.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const updatedPins = [...pins];
      updatedPins[index] = { ...updatedPins[index], x, y };
      setPins(updatedPins);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const addPin = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (newPinText.trim() !== "") {
      setPins([...pins, { x, y, text: newPinText }]);
      setNewPinText("");
    }
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
        {pins.map((pin, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${pin.x}px`,
              top: `${pin.y}px`,
              width: "auto",
              height: "auto",
              backgroundColor: "red",
              borderRadius: "8px",
              padding: "5px",
              cursor: "move",
              userSelect: "none",
              zIndex: 1,
            }}
            onMouseDown={makePinDraggable(index)}
          >
            {pin.text}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "auto",
            height: "auto",
            backgroundColor: "blue",
            borderRadius: "8px",
            padding: "5px",
            cursor: "pointer",
            userSelect: "none",
            zIndex: 1,
          }}
          onMouseDown={addPin}
        >
          {newPinText}
        </div>
        <input
          type="text"
          value={newPinText}
          onChange={(e) => setNewPinText(e.target.value)}
        />
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default Building;
