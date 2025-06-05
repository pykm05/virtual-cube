import { getSocket } from "@/lib/socket";
import { Cube } from "../components/three/cube";
import Scene from "../components/three/scene";

export default function newScene(container: HTMLElement, socketID: string) {
  if (container.hasChildNodes()) return;

  const { scene, renderer, camera } = Scene(container);
  const cube = new Cube(scene, renderer, camera);

  const socket = getSocket();
  const notOpponentScene = socket.id != socketID;

  if (notOpponentScene) {
    window.addEventListener('keydown', (e) => socket.emit("keyboard input", socket.id, e.key));
  }

  socket.on("keyboard input", (socketID: string, key: string) => {
    if ((!notOpponentScene && socketID != socket.id) || (notOpponentScene && socketID == socket.id)) cube.handleInput(key);
  });

  renderer.render(scene, camera);
}