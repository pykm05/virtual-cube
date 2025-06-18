import * as THREE from "three";
import {
  CubeState, EulerAxis, Direction, CubeAction, ninetyDegrees, nearlyEqual
} from "../../types/cubeTypes";

/**
 * Handles rendering, animating, and manipulating a 3x3x3 Rubik's Cube using Three.js
 */
class Cube {
  public cubeStatus = CubeState.NOT_MOVING;
  private static readonly TURN_SPEED = Math.PI / 8;

  private moveQueue: Array<{ action: CubeAction; axis: EulerAxis; layer: number; direction: Direction }> = [];
  private axis: EulerAxis = 'x';
  private layer = 1;
  private direction = Direction.forward;
  private action = CubeAction.turn;

  private cubePosition = new WeakMap<THREE.Mesh, THREE.Vector3>();
  private pivot = new THREE.Object3D(); // Used to rotate a single layer
  private fullGroup = new THREE.Group(); // Used to rotate the whole cube

  private allPieces: THREE.Mesh[] = [];
  private activeGroup: THREE.Mesh[] = [];
  private solvedState: { position: THREE.Vector3 }[] = [];

  // Shared materials for each face
  private static readonly FACE_MATERIALS = [
    new THREE.MeshLambertMaterial({ color: 0xff6b35 }), // Right  (x = +1)
    new THREE.MeshLambertMaterial({ color: 0xff8500 }), // Left   (x = -1)
    new THREE.MeshLambertMaterial({ color: 0xffffff }), // Top    (y = +1)
    new THREE.MeshLambertMaterial({ color: 0xffd500 }), // Bottom (y = -1)
    new THREE.MeshLambertMaterial({ color: 0x00d646 }), // Front  (z = +1)
    new THREE.MeshLambertMaterial({ color: 0x0085ff })  // Back   (z = -1)
  ];
  private static readonly BLACK_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  private static readonly EDGE_GEOMETRY = new THREE.BoxGeometry(0.98, 0.98, 0.98);

  constructor(
    private scene: THREE.Scene,
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera
  ) {
    this.buildCube();
    this.cacheSolvedState();
    this.animate();
  }

  /** Create the 27 pieces of the Rubik's cube and add them to the scene */
  private buildCube() {
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++)
          this.createPiece(x, y, z);
  }

  /** Generate a cube piece at the given coordinate and assign face colors */
  private createPiece(x: number, y: number, z: number) {
    const materials = this.getPieceMaterials(x, y, z);
    const piece = new THREE.Mesh(Cube.EDGE_GEOMETRY, materials);
    (piece as any).pieceId = this.allPieces.length;

    piece.position.set(x, y, z);
    piece.scale.setScalar(0.95); // Slight gap between pieces

    this.cubePosition.set(piece, piece.position.clone());
    this.allPieces.push(piece);
    this.scene.add(piece);

    // Add a black marker to the (1,1,1) corner to indicate orientation
    if (x === 1 && y === 1 && z === 1) {
      const marker = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.3),
        new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
      );
      marker.position.set(0, 0.51, 0);
      marker.rotation.x = -Math.PI / 2;
      piece.add(marker);
    }
  }

  /** Determine which faces of a cube piece should be colored */
  private getPieceMaterials(x: number, y: number, z: number) {
    const m = Cube.FACE_MATERIALS, b = Cube.BLACK_MATERIAL;
    return [
      x === 1 ? m[0] : b, // right
      x === -1 ? m[1] : b, // left
      y === 1 ? m[2] : b, // top
      y === -1 ? m[3] : b, // bottom
      z === 1 ? m[4] : b, // front
      z === -1 ? m[5] : b  // back
    ];
  }

  /** Save initial solved position of all pieces for comparison */
  private cacheSolvedState() {
    this.solvedState = this.allPieces.map(p => ({ position: p.position.clone() }));
  }

  /** Check if the cube is back in its original solved position (approximate check) */
  public async isSolved(): Promise<boolean> {
    while (this.cubeStatus !== CubeState.NOT_MOVING) {
      await new Promise(r => setTimeout(r, 10));
    }

    const tol = 0.001;
    const n = this.allPieces.length;

    for (let i = 0; i < n; i++) {
      const worldA = this.allPieces[i].getWorldPosition(new THREE.Vector3());
      const solvedA = this.solvedState[i].position;

      for (let j = i + 1; j < n; j++) {
        const worldB = this.allPieces[j].getWorldPosition(new THREE.Vector3());
        const solvedB = this.solvedState[j].position;
        if (Math.abs(worldA.distanceTo(worldB) - solvedA.distanceTo(solvedB)) > tol) {
          return false;
        }
      }
    }
    return true;
  }

   /**
   * Map user key input to a cube move.
   * Controls:
   *  - f / j → U / U'   (Up face clockwise / counter-clockwise)
   *  - s / l → D / D'   (Down face clockwise / counter-clockwise)
   *  - i / k → R / R'   (Right face clockwise / counter-clockwise)
   *  - d / e → L / L'   (Left face clockwise / counter-clockwise)
   *  - h / g → F / F'   (Front face clockwise / counter-clockwise)
   *  - w / o → B / B'   (Back face clockwise / counter-clockwise)
   *
   *  - x / . → M' / M   (Middle slice between L and R)
   *  - 6       → M      (Middle slice between L and R in opposite dir)
   *  - 0 / 1 → S / S'   (Middle slice between F and B)
   *  - 2 / 9 → E / E'   (Middle slice between U and D)
   *
   *  - a / ; → y / y'   (Whole cube rotation around y-axis)
   *  - y / b → x / x'   (Whole cube rotation around x-axis)
   *  - q / p → z / z'   (Whole cube rotation around z-axis)
   */

  public handleInput(key: string) {
    const m = this.addToQueue.bind(this);
    const t = CubeAction.turn, r = CubeAction.cubeRotation;

    const map: Record<string, [CubeAction, EulerAxis, number, Direction]> = {
      // y-axis (top/bottom layers)
      f: [t, 'y', 1, Direction.forward],
      j: [t, 'y', 1, Direction.backward],
      s: [t, 'y', -1, Direction.forward],
      l: [t, 'y', -1, Direction.backward],

      // x-axis (top/bottom layers)
      i: [t, 'x', 1, Direction.backward],
      k: [t, 'x', 1, Direction.forward],
      d: [t, 'x', -1, Direction.forward],
      e: [t, 'x', -1, Direction.backward],

      // z-axis (front/back layers)
      h: [t, 'z', 1, Direction.backward],
      g: [t, 'z', 1, Direction.forward],
      w: [t, 'z', -1, Direction.forward],
      o: [t, 'z', -1, Direction.backward],

      // middle layers
      x: [t, 'x', 0, Direction.backward],
      '.': [t, 'x', 0, Direction.backward],
      '6': [t, 'x', 0, Direction.forward],
      '0': [t, 'z', 0, Direction.backward],
      '1': [t, 'z', 0, Direction.forward],
      '2': [t, 'y', -0, Direction.forward],
      '9': [t, 'y', -0, Direction.backward],

      // cube rotations
      ';': [r, 'y', 1, Direction.backward],
      a: [r, 'y', 1, Direction.forward],
      y: [r, 'x', 1, Direction.backward],
      b: [r, 'x', 1, Direction.forward],
      p: [r, 'z', 1, Direction.backward],
      q: [r, 'z', 1, Direction.forward],
    };

    map[key] && m(...map[key]);
  }

  /** Add a move to the queue and start processing if idle */
  private addToQueue(action: CubeAction, axis: EulerAxis, layer: number, direction: Direction) {
    this.moveQueue.push({ action, axis, layer, direction });
    this.processQueue();
  }

  /** Begin executing the next move in the queue if cube is idle */
  private processQueue() {
    if (this.cubeStatus === CubeState.NOT_MOVING && this.moveQueue.length) {
      const move = this.moveQueue.pop()!;
      this.setupMove(move);
      this.cubeStatus = CubeState.MOVE_IN_PROGRESS;
      this.processQueue(); // Enable chaining
    }
  }

  /** Prepare the appropriate group of pieces for the next move */
  private setupMove({ action, axis, layer, direction }: {
    action: CubeAction;
    axis: EulerAxis;
    layer: number;
    direction: Direction;
  }) {
    this.action = action;
    this.axis = axis;
    this.layer = layer;
    this.direction = direction;

    if (action === CubeAction.cubeRotation) {
      this.fullGroup = new THREE.Group();
      this.scene.add(this.fullGroup);
      this.fullGroup.rotation.set(0, 0, 0);
      this.allPieces.forEach(p => this.fullGroup.add(p));
    } else {
      this.pivot.rotation.set(0, 0, 0);
      this.scene.add(this.pivot);
      this.activeGroup = this.allPieces.filter(p =>
        nearlyEqual(p.position[axis], layer)
      );
      this.activeGroup.forEach(p => this.pivot.add(p));
    }
  }

  /** Animation loop (called via requestAnimationFrame) */
  private animate() {
    if (this.cubeStatus === CubeState.MOVE_IN_PROGRESS) {
      this.action === CubeAction.turn
        ? this.performTurn()
        : this.performRotation();
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  /** Rotate one layer of the cube around the chosen axis */
  private performTurn() {
    this.pivot.rotation[this.axis] += this.direction * Cube.TURN_SPEED;

    if (Math.abs(this.pivot.rotation[this.axis]) >= ninetyDegrees) {
      const target = ninetyDegrees * this.direction;
      this.pivot.rotation[this.axis] = target;

      const axisVec = new THREE.Vector3(
        this.axis === 'x' ? 1 : 0,
        this.axis === 'y' ? 1 : 0,
        this.axis === 'z' ? 1 : 0
      );
      const quat = new THREE.Quaternion().setFromAxisAngle(axisVec, target);

      this.pivot.children.forEach(piece => {
        piece.quaternion.premultiply(quat);
        piece.rotation.setFromQuaternion(piece.quaternion);
      });

      // Detach and reinsert into the main scene
      this.scene.remove(this.pivot);
      this.activeGroup.forEach(piece => {
        piece.updateMatrixWorld();
        const worldPos = piece.getWorldPosition(new THREE.Vector3());
        this.scene.add(piece);
        piece.position.copy(worldPos);
        piece.updateMatrixWorld(true);
        this.cubePosition.set(piece, worldPos.clone());
      });

      this.cubeStatus = CubeState.NOT_MOVING;
    }
  }

  /** Rotate the entire cube along the chosen axis */
  private performRotation() {
    this.fullGroup.rotation[this.axis] += this.direction * Cube.TURN_SPEED;

    if (Math.abs(this.fullGroup.rotation[this.axis]) >= ninetyDegrees) {
      this.allPieces.forEach(piece => {
        piece.updateMatrixWorld();
        const pos = piece.getWorldPosition(new THREE.Vector3());
        const quat = piece.getWorldQuaternion(new THREE.Quaternion());
        this.scene.add(piece);
        piece.position.copy(pos);
        piece.quaternion.copy(quat);
        piece.rotation.setFromQuaternion(quat);
        piece.updateMatrixWorld(true);
      });

      this.scene.remove(this.fullGroup);
      this.cubeStatus = CubeState.NOT_MOVING;
    }
  }
}

export { Cube };
