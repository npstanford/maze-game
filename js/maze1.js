/*
* Author: Nick Stanford
* Uses THREE.js
*
*/

//CONSTANTS
var CHARACTER_HEIGHT = 20;
var WALL_HEIGHT = 20;
var WALL_WIDTH = 20;
var MAZE_WIDTH = 20;
var MAZE_HEIGHT = 20;

//GLOBALS
var mazeGrid;
var clock = new THREE.Clock();
var count = 0;
var globalCamera;
var globalControls;
var fpsCamera;
var fpsControls;

var lights = new Array();
var numLights = 4;

var activeCamera = 1;

//leettttts GOOOO!
window.onload = function() {
	init();
	animate();
}
function init() {

	var width = window.innerWidth;
	var height = window.innerHeight;

	maze = new TwoDMaze(MAZE_WIDTH, MAZE_HEIGHT);

	//set up the renderer
	renderer = new THREE.WebGLRenderer({
		antialias : true
	});

	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);

	renderer.setClearColorHex(0xEEEEEE, 1.0);
	renderer.shadowMapEnabled = false;
	renderer.shadowMapWidth = 1024;
	;
	renderer.shadowMapHeight = 1024;

	renderer.clear();

	//set up the global camera
	globalCamera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
	globalCamera.y = CHARACTER_HEIGHT;

	//set up the global controls
	globalControls = new THREE.FirstPersonControls(globalCamera);
	globalControls.movementSpeed = 100;
	globalControls.lookSpeed = .12;
	
	//set up the first person camera
	fpsCamera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
	fpsCamera.y = CHARACTER_HEIGHT;
	
	//set up the controls
	fpsControls = new THREE.MazeCamera(fpsCamera);
	fpsControls.movementSpeed = 100;
	fpsControls.lookSpeed = .12;
	fpsControls.noFly = true;


	//set up the scene
	scene = new THREE.Scene();

	//add the lights

	for (var i = 0; i < numLights; i++) {

		var light = new THREE.DirectionalLight();
		light.castShadow = true;
		light.shadowCamera = new THREE.OrthographicCamera()

		light.shadowCameraRight = 5;
		light.shadowCameraLeft = -5;
		light.shadowCameraTop = 5;
		light.shadowCameraBottom = -5;

		light.shadowCameraVisible = true;
		light.position.set(0, 0, 0);
		light.intensity = 1;
		light.castShadow = true;
		lights.push(light);
	}

	lights[0].position.set(0, 100, 100);
	lights[1].position.set(100, 100, 0);

	lights[2].position.set(0, 100, -100);
	lights[3].position.set(-100, 100, 0);

	for (var i = 0; i < numLights; i++) {
		scene.add(lights[i]);
	}

	//build the floor
	floor = new THREE.Mesh(new THREE.PlaneGeometry(MAZE_WIDTH * WALL_WIDTH, MAZE_HEIGHT * WALL_WIDTH, 10, 10), new THREE.MeshLambertMaterial({
		color : 0x00ff00,
	}));
	floor.receiveShadow = true;
	//shift so that the origin is at the lower left corner
	floor.position.x = MAZE_WIDTH * WALL_WIDTH / 2;
	floor.position.z = MAZE_HEIGHT * WALL_WIDTH / 2;
	scene.add(floor);

	//build all of the walls
	for (var i = 0; i < maze.walls.length; i++) {
		wallInfo = maze.walls[i];
		var hexColor = Math.round(16777215 * Math.random()).toString(16);
		var mesh = new THREE.MeshLambertMaterial({
			color : get_random_color(),
		});
		var wall = new THREE.Mesh(new THREE.PlaneGeometry(WALL_WIDTH, WALL_HEIGHT, 10, 10), mesh);

		wall.doubleSided = true;
		wall.receiveShadow = true;

		//standing the wall up, every wall needs this done
		wall.rotation.x = Math.PI / 2;

		//move it to the proper cell
		var c1x = wallInfo.c1.x;
		var c1z = wallInfo.c1.z;
		var c2x = wallInfo.c2.x;
		var c2z = wallInfo.c2.z;

		wall.position.y = WALL_HEIGHT / 2;

		//wall.position.x = c1x * WALL_WIDTH + .5 * WALL_WIDTH;
		//wall.position.z = c1z * WALL_WIDTH + .5 * WALL_WIDTH;

		wall.position.x = (c1x + c2x) / 2 * WALL_WIDTH;
		wall.position.z = (c1z + c2z) / 2 * WALL_WIDTH;

		switch (wallInfo.relation) {

			case 0:
				//up

				//wall.position.z += .5 * WALL_WIDTH;
				wall.rotation.z = Math.PI / 2;

			case 1:
				//down

				//wall.position.z -= .5 * WALL_WIDTH;
				wall.rotation.z = Math.PI / 2;

			case 2:
			//left
			//wall.position.x += .5 * WALL_WIDTH;

			case 3:
			//right
			//wall.position.x -= .5 * WALL_WIDTH;

		}

		scene.add(wall);
	}

	//build all of the walls around the maze
	//top walls
	for (var i = 0; i < MAZE_WIDTH; i++) {
		var mesh = new THREE.MeshLambertMaterial({
			color : get_random_color(),
		});
		var wall = new THREE.Mesh(new THREE.PlaneGeometry(WALL_WIDTH, WALL_HEIGHT, 10, 10), mesh);
		wall.position.z = WALL_WIDTH * MAZE_HEIGHT;
		wall.position.x = WALL_WIDTH * i + .5 * WALL_WIDTH;
		wall.position.y = WALL_HEIGHT / 2;

		wall.doubleSided = true;
		wall.receiveShadow = true;

		//standing the wall up, every wall needs this done
		wall.rotation.x = Math.PI / 2;

		scene.add(wall);
	}

	//bottom walls
	for (var i = 0; i < MAZE_WIDTH; i++) {
		var mesh = new THREE.MeshLambertMaterial({
			color : get_random_color(),
		});
		var wall = new THREE.Mesh(new THREE.PlaneGeometry(WALL_WIDTH, WALL_HEIGHT, 10, 10), mesh);
		wall.position.x = WALL_WIDTH * i + .5 * WALL_WIDTH;
		wall.position.y = WALL_HEIGHT / 2;

		wall.doubleSided = true;
		wall.receiveShadow = true;

		//standing the wall up, every wall needs this done
		wall.rotation.x = Math.PI / 2;

		scene.add(wall);
	}

	//left side
	for (var i = 0; i < MAZE_WIDTH; i++) {
		var mesh = new THREE.MeshLambertMaterial({
			color : get_random_color(),
		});
		var wall = new THREE.Mesh(new THREE.PlaneGeometry(WALL_WIDTH, WALL_HEIGHT, 10, 10), mesh);
		wall.position.x = WALL_WIDTH * MAZE_WIDTH;
		wall.position.z = WALL_WIDTH * i + .5 * WALL_WIDTH;
		wall.position.y = WALL_HEIGHT / 2;

		wall.doubleSided = true;
		wall.receiveShadow = true;

		//standing the wall up, every wall needs this done
		wall.rotation.x = Math.PI / 2;
		wall.rotation.z = Math.PI / 2;

		scene.add(wall);
	}

	//right side
	for (var i = 0; i < MAZE_WIDTH; i++) {
		var mesh = new THREE.MeshLambertMaterial({
			color : get_random_color(),
		});
		var wall = new THREE.Mesh(new THREE.PlaneGeometry(WALL_WIDTH, WALL_HEIGHT, 10, 10), mesh);
		wall.position.z = WALL_WIDTH * i + .5 * WALL_WIDTH;
		wall.position.y = WALL_HEIGHT / 2;

		wall.doubleSided = true;
		wall.receiveShadow = true;

		//standing the wall up, every wall needs this done
		wall.rotation.x = Math.PI / 2;
		wall.rotation.z = Math.PI / 2;

		scene.add(wall);
	}

	renderer.render(scene, fpsCamera);

}

function animate() {
	count++;

	//terrainInfo is an object which contains whatever info is needed by the camera for the current location
	var terrainInfo = {elevation : CHARACTER_HEIGHT/2};

	if (activeCamera == 1) {
		fpsControls.update(clock.getDelta(), terrainInfo);
		renderer.render(scene, fpsCamera);
	} else {
		globalControls.update(clock.getDelta(), terrainInfo);
		renderer.render(scene, globalCamera)
	}

	window.requestAnimationFrame(animate, renderer.domElement);
}

function TwoDMaze(width, height) {

	this.width = width + 2;
	//the plus two is for the buffer zone we add around each maze
	this.height = height + 2;
	this.walls = new Array();
	this.sectors = new Array();
	this.start
	this.wallCount = 0;

	this._wallQueue = new Array();
	this._cells = new Array(this.height);
	//populate the representation of the unsculpted matrix
	for (var i = 0; i < this.height; i++) {
		this._cells[i] = new Array(this.width);
		for (var j = 0; j < this.width; j++) {
			// a false indicates that the node hasn't been incorporated into the maze yet
			this._cells[i][j] = {
				'x' : i,
				'z' : j,
				'visited' : false,
				'buffered' : false
			};
			if (i == 0 || i == this.height - 1 || j == 0 || j == this.width - 1) {
				//this._cells[i][j].visited = true;
				this._cells[i][j].buffered = true;
			}
		}
	}

	this._addWallsToQueue = function(cell) {
		var neighbors = [];
		if (cell.buffered == true) {
			return;
		}
		//we now add the walls of the newly visited cell
		neighbors.push(this._cells[cell.x][cell.z + 1]);
		// up
		neighbors.push(this._cells[cell.x][cell.z - 1]);
		// down
		neighbors.push(this._cells[cell.x - 1][cell.z]);
		// left
		neighbors.push(this._cells[cell.x + 1][cell.z]);
		// right

		//okay, i've got this idea for making a special buffer zone around the maze. A wall can exist between a buffer cell
		//and a regular cell, but you'll never add a buffer cell to the queue'

		for (var i = 0; i < neighbors.length; i++) {
			if (!neighbors[i].buffered) {
				if (!neighbors[i].visited) {//implies this wall has not yet been added
					this._wallQueue.push({
						'c1' : cell,
						'c2' : neighbors[i],
						'relation' : i
					});
				}
			}
		}
	}

	this.start = this._cells[Math.round(this.width / 2)][Math.round(this.height / 2)];
	this.start.visited = true;

	this._addWallsToQueue(this.start);

	//the main loop of prims
	while (this._wallQueue.length > 0) {
		this.wallCount++;
		console.log(this.wallCount);
		var cellIndex = Math.floor((this._wallQueue.length) * Math.random());
		var wall = this._wallQueue[cellIndex];
		this._wallQueue.splice(cellIndex, 1);
		//remove the randomly chosen wall from the 'queue'

		var cell;
		if (wall.c1.visited == true && wall.c2.visited == true) {
			// if both cells are already in the maze, we add the wall to the maze, and break to go to the next wall
			this.walls.push(wall);
			continue;
		} else if (wall.c1.visited == false && wall.c2.visited == true) {
			cell = wall.c1;
		} else if (wall.c1.visited == true && wall.c2.visited == false) {
			cell = wall.c2;
		} else {
			console.log('ERROR: Inconsistent state, wall in queue but neither cell visited');
			continue;
		}

		//this.walls.push(wall); //uncomment to add all walls
		this._addWallsToQueue(cell);

		cell.visited = true;
	}

}

//bind keys for camera switch
function onKeyDown() {
	switch( event.keyCode ) {
		case 71:
			//G
			if (activeCamera == 1) {
				activeCamera = 2;
			} else {
				activeCamera = 1;
			}
			console.log('activeCamera now: ' + activeCamera);
			break;
	}
}

document.addEventListener('keydown', onKeyDown, false);

function get_random_color() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '0x';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.round(Math.random() * 15)];
	}
	return color;
}
