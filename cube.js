import * as THREE from 'three';

export class Cube {
	pieces = [];
  groups = [];

  Full_Cube = new THREE.Group();
	U_Layer = new THREE.Group();
	F_Layer = new THREE.Group();

  // temporary single-layer cube
  constructor() {
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        for (let k = -1; k < 2; k++) {
          this.pieces.push(this.Piece(i, j ,k));
        }
      
      }
    }

    this.groups.push(this.U_Layer);
    this.groups.push(this.F_Layer);
    this.groups.push(this.Full_Cube);
  };

	Piece(x, y, z) {
		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const piece = new THREE.Mesh( geometry, material );

		piece.position.set(x, y, z);
		return piece;
	};
}