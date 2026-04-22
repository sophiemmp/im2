import * as THREE from 'three';

// basic constances
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();

// container where scene is rendered
const renderContainer = document.getElementById('render-container');

renderer.setSize( window.innerWidth, window.innerHeight );

// add scene to DOM
renderContainer.appendChild(renderer.domElement);


// basic cube for testing
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

window.addEventListener( 'resize', onWindowResize, false );

// render animation function (has to be at the bottom)
function animate( time ) {

	// animate the cube
	cube.rotation.x = time / 2000;
	cube.rotation.y = time / 1000;

	renderer.render( scene, camera );
}

// render animated scene
renderer.setAnimationLoop( animate );


// resize scene on window resize
function onWindowResize() {

    camera.aspect = renderContainer.clientWidth / renderContainer.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
}