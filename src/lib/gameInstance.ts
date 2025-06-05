import { getSocket } from "@/lib/socket";
import { Cube } from "../components/three/cube";
import Scene from "../components/three/scene";

export default function newScene(container: HTMLElement, assignedSocketID: string) {
  const { scene, renderer, camera } = Scene(container);
  const cube = new Cube(scene, renderer, camera);

  const socket = getSocket();
  const emitter = socket.id == assignedSocketID;

  if (emitter) window.addEventListener('keydown', (e) => socket.emit("keyboard input", socket.id, e.key));

  socket.on("keyboard input", (socketID: string, key: string) => {
    if ((emitter && socket.id == socketID) || (!emitter && assignedSocketID == socketID)) cube.handleInput(key);
  });
}