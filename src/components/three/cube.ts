import * as THREE from "three";
import { CubeState, EulerAxis, Direction, CubeAction, ninetyDegrees, nearlyEqual } from "../../types/cubeTypes";

class Cube {

    public cubeStatus = CubeState.NOT_MOVING;
    static readonly turnSpeed = Math.PI / 10;
    private moveQueue: Array<{ action: CubeAction, axis: EulerAxis, layer: number, direction: number }> = [];

    private axis: EulerAxis = 'x';
    private layer = 1;
    private direction: Direction = Direction.forward;
    private action: CubeAction = CubeAction.turn;
    private cubePosition = new WeakMap<THREE.Mesh, THREE.Vector3>();
    private pivot = new THREE.Object3D();
    private allPieces: THREE.Mesh[] = [];
    private activeGroup: THREE.Mesh[] = [];
    private fullGroup: THREE.Group = new THREE.Group;
    private solvedState: { position: THREE.Vector3 }[] = [];

    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.Camera;

    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    this.createPiece(i, j, k);
                }
            }
        }

        this.solvedState = this.allPieces.map(p => ({
            id: (p as any).pieceId,
            position: p.position.clone(),
        }));

        this.render();
    }

    private createPiece(i: number, j: number, k: number) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterials = [
            new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Right - Red
            new THREE.MeshBasicMaterial({ color: 0xffa500 }), // Left - Orange
            new THREE.MeshBasicMaterial({ color: 0xffffff }), // Top - White
            new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Bottom - Yellow
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Front - Green
            new THREE.MeshBasicMaterial({ color: 0x0000ff })  // Back - Blue
        ];

        const piece = new THREE.Mesh(geometry, cubeMaterials);
        const pieceId = this.allPieces.length;
        (piece as any).pieceId = pieceId;
        piece.position.set(i, j, k);

        this.cubePosition.set(piece, piece.position.clone());
        this.allPieces.push(piece);

        // special piece to track coordinates
        if (i === 1 && j === 1 && k === 1) {
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.lineTo(0, 1);
            shape.lineTo(1, 1);
            shape.lineTo(1, 0);
            shape.lineTo(0, 0);

            const shapeGeometry = new THREE.ShapeGeometry(shape);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
            const shapeMesh = new THREE.Mesh(shapeGeometry, material);

            piece.add(shapeMesh);

            shapeMesh.position.set(-0.5, 1, -0.5);

            shapeMesh.rotation.x = ninetyDegrees;
        }

        this.scene.add(piece);
    }

    async isSolved() {
        while (this.cubeStatus !== CubeState.NOT_MOVING) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const tolerance = 0.001;

        for (let i = 0; i < this.allPieces.length; i++) {
            const pieceA = this.allPieces[i];
            const posA = pieceA.getWorldPosition(new THREE.Vector3());

            for (let j = i + 1; j < this.allPieces.length; j++) {
                const pieceB = this.allPieces[j];
                const posB = pieceB.getWorldPosition(new THREE.Vector3());

                const currentDist = posA.distanceTo(posB);

                const solvedPosA = this.solvedState[i].position;
                const solvedPosB = this.solvedState[j].position;
                const solvedDist = solvedPosA.distanceTo(solvedPosB);

                if (Math.abs(currentDist - solvedDist) > tolerance) {
                    return false;
                }
            }
        }

        return true;
    }

    handleInput(e: string) {
        switch (e) { // params: action type, axis, layer, direction
            case 'f': this.addToQueue(CubeAction.turn, 'y', 1, Direction.forward); break; // U
            case 'j': this.addToQueue(CubeAction.turn, 'y', 1, Direction.backward); break; // U'
            case 's': this.addToQueue(CubeAction.turn, 'y', -1, Direction.forward); break; // D
            case 'l': this.addToQueue(CubeAction.turn, 'y', -1, Direction.backward); break; // D'
            case 'i': this.addToQueue(CubeAction.turn, 'x', 1, Direction.backward); break; // R
            case 'k': this.addToQueue(CubeAction.turn, 'x', 1, Direction.forward); break; // R'
            case 'd': this.addToQueue(CubeAction.turn, 'x', -1, Direction.forward); break; // L
            case 'e': this.addToQueue(CubeAction.turn, 'x', -1, Direction.backward); break; // L'
            case 'h': this.addToQueue(CubeAction.turn, 'z', 1, Direction.backward); break; // F
            case 'g': this.addToQueue(CubeAction.turn, 'z', 1, Direction.forward); break; // F'
            case 'w': this.addToQueue(CubeAction.turn, 'z', -1, Direction.forward); break; // B
            case 'o': this.addToQueue(CubeAction.turn, 'z', -1, Direction.backward); break; // B'
            case 'x': this.addToQueue(CubeAction.turn, 'x', 0, Direction.backward); break; // M'
            case '.': this.addToQueue(CubeAction.turn, 'x', 0, Direction.backward); break; // M'
            case '6': this.addToQueue(CubeAction.turn, 'x', 0, Direction.forward); break; // M
            case '0': this.addToQueue(CubeAction.turn, 'z', 0, Direction.backward); break; // S
            case '1': this.addToQueue(CubeAction.turn, 'z', 0, Direction.forward); break; // S'
            case '2': this.addToQueue(CubeAction.turn, 'y', -1, Direction.forward); break; // E
            case '9': this.addToQueue(CubeAction.turn, 'y', -1, Direction.backward); break; // E'

            // layer default to 1
            case ';': this.addToQueue(CubeAction.cubeRotation, 'y', 1, Direction.backward); break; // y
            case 'a': this.addToQueue(CubeAction.cubeRotation, 'y', 1, Direction.forward); break; // y'
            case 'y': this.addToQueue(CubeAction.cubeRotation, 'x', 1, Direction.backward); break; // x
            case 'b': this.addToQueue(CubeAction.cubeRotation, 'x', 1, Direction.forward); break; // x'
            case 'p': this.addToQueue(CubeAction.cubeRotation, 'z', 1, Direction.backward); break; // z
            case 'q': this.addToQueue(CubeAction.cubeRotation, 'z', 1, Direction.forward); break; // z'
        }

        // console.log('cube is', this.isSolved());
    }

    private doTurn() {
        this.pivot.rotation[this.axis] += (this.direction * Cube.turnSpeed);

        if (this.pivot.rotation[this.axis] >= ninetyDegrees ||
            this.pivot.rotation[this.axis] <= -ninetyDegrees
        ) {
            const targetRotation = ninetyDegrees * this.direction;
            this.pivot.rotation[this.axis] = targetRotation;

            this.pivot.children.forEach((piece) => {
                const axisVector = new THREE.Vector3(
                    this.axis === 'x' ? 1 : 0,
                    this.axis === 'y' ? 1 : 0,
                    this.axis === 'z' ? 1 : 0
                );

                const quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(axisVector, targetRotation);
                piece.quaternion.premultiply(quaternion);

                piece.rotation.setFromQuaternion(piece.quaternion);
            });

            this.pivot.updateMatrixWorld();
            this.scene.remove(this.pivot);

            this.activeGroup.forEach((piece) => {
                piece.updateMatrixWorld();
                this.cubePosition.set(piece, piece.position.clone());
                const worldPosition = piece.getWorldPosition(new THREE.Vector3());

                this.pivot.remove(piece);
                this.scene.add(piece);
                piece.position.copy(worldPosition);
                piece.updateMatrixWorld(true);
            });

            this.cubeStatus = CubeState.NOT_MOVING;
        }
    }

    private doRotation() {
        this.fullGroup.rotation[this.axis] += (this.direction * Cube.turnSpeed);

        if (Math.abs(this.fullGroup.rotation[this.axis]) >= ninetyDegrees) {
            this.allPieces.forEach((piece) => {
                piece.updateMatrixWorld();
                const worldPosition = piece.getWorldPosition(new THREE.Vector3());
                const worldQuaternion = piece.getWorldQuaternion(new THREE.Quaternion());

                this.fullGroup.remove(piece);
                this.scene.add(piece);

                piece.position.copy(worldPosition);
                piece.quaternion.copy(worldQuaternion);
                piece.rotation.setFromQuaternion(worldQuaternion);
                piece.updateMatrixWorld(true);
            });

            this.scene.remove(this.fullGroup);
            this.cubeStatus = CubeState.NOT_MOVING;
        }
    }

    private updateCubeStatus() {
        if (this.cubeStatus == CubeState.NOT_MOVING && this.moveQueue.length > 0) {
            const move = this.moveQueue.pop();

            if (!move) return;

            const { action, axis, layer, direction } = move;
            this.setActiveGroup(action, axis, layer, direction);

            this.cubeStatus = CubeState.MOVE_IN_PROGRESS; // triggers doTurn() or doRotation() in render()
            this.updateCubeStatus();
        }
    }

    private addToQueue(action: CubeAction, axis: EulerAxis, layer: number, direction: Direction) {
        this.moveQueue.push({ action, axis, layer, direction });
        this.updateCubeStatus();
    }

    private setActiveGroup(action: CubeAction, axis: EulerAxis, layer: number, direction: Direction) {
        this.action = action;
        this.axis = axis;
        this.layer = layer;
        this.direction = direction;

        if (action == CubeAction.cubeRotation) {
            this.fullGroup = new THREE.Group();
            this.scene.add(this.fullGroup);

            this.fullGroup.rotation.set(0, 0, 0);

            this.allPieces.forEach((piece) => {
                this.fullGroup.add(piece);
            });
        } else {
            this.activeGroup = [];
            this.pivot.rotation.set(0, 0, 0);
            this.scene.add(this.pivot);

            this.allPieces.forEach((piece) => {
                if (nearlyEqual(piece.position[axis], this.layer)) {
                    this.activeGroup.push(piece);
                }
            });
            this.activeGroup.forEach((piece) => {
                this.pivot.add(piece);
            });
        }
    }

    private render() {
        if (this.cubeStatus == CubeState.MOVE_IN_PROGRESS) {
            this.action == CubeAction.turn ? this.doTurn() : this.doRotation();
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.render());
    }
}

export { Cube };
