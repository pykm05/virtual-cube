import { getSocket } from "@/socket";
import { Cube } from "./cube/cube";
import Scene from "./cube/scene";

export default function gameInstance(container: HTMLElement, socketID: string) {
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