import * as THREE from 'three';

export class Cube {
	pieces = [];
  groups = [];

	U_Layer = new THREE.Group();
	F_Layer = new THREE.Group();

  // temporary single-layer cube
  constructor() {
    this.pieces.push(this.Piece(-1, 0, -1));
    this.pieces.push(this.Piece(0, 0, 0));
    this.pieces.push(this.Piece(0, 0, -1));
    this.pieces.push(this.Piece(1, 0, -1));
    this.pieces.push(this.Piece(-1, 0, 0));
    this.pieces.push(this.Piece(1, 0, 0));
    this.pieces.push(this.Piece(-1, 0, 1));
    this.pieces.push(this.Piece(0, 0, 1));
    this.pieces.push(this.Piece(1, 0, 1));

    this.groups.push(this.U_Layer);
    this.groups.push(this.F_Layer);
  };

	createCube(x, y, z) {
		if (x == 1 || y == 1 || z == 1) {
			this.pieces.add(Piece(x, y, z));
			return;
		}
	}

	Piece(x, y, z) {
		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const piece = new THREE.Mesh( geometry, material );
    if (y == 0) {
      this.U_Layer.add(piece)
    }
    if (z == 1) {
      this.F_Layer.add(piece);
    }

		piece.position.set(x, y, z);
		return piece;
	};
}