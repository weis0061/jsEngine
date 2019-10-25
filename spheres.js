import * as THREE from 'three';

var cubesPerSphere = 30;
var colorPool = Array(cubesPerSphere);
var spherePool=[];
for (let i = 0; i <= cubesPerSphere; i++) {
    var col = new THREE.Color(0xff0000);
    colorPool[i]=col.setHSL(Math.sin(i), Math.random() * 0.5 + 0.5, Math.random() * 0.9 + 0.1);
}

var setCubePos = (cube, currentTime, sphere) => {
    /**@type {THREE.Mesh} */
    var mesh = cube.mesh;
    mesh.position.x = sphere.mesh.position.x + Math.sin(currentTime * cube.speed + cube.cubeNum) * cube.dist * Math.sin(currentTime * sphere.spheremoveSpeed / 2);
    mesh.position.y = sphere.mesh.position.y + Math.cos(currentTime * cube.speed + cube.cubeNum) * cube.dist * Math.sin(currentTime * sphere.spheremoveSpeed / 2);
    mesh.position.z = sphere.mesh.position.z;
    var euler = new THREE.Euler();
    var vec = new THREE.Vector3(
        sphere.mesh.position.x - cube.mesh.position.x,
        sphere.mesh.position.y - cube.mesh.position.y,
        sphere.mesh.position.z - cube.mesh.position.z);
}
/**
 * 
 * @param {color} spherecolor 0xRRGGBB
 * @param {ThreeJS Scene} scene 
 */
export var addSphere = (spherecolor, scene) => {
        
    var geometry = new THREE.SphereGeometry(1, 16, 16);
    var material = new THREE.MeshBasicMaterial({ color: spherecolor, depthTest: true, depthWrite: true });
    var sphere = { mesh: new THREE.Mesh(geometry, material), spheremoveSpeed: Math.random() * 3 / 800 , cubes:[]};
    sphere.mesh.position.x = 1;
    sphere.mesh.position.y = 1;
    scene.add(sphere.mesh);
    var numCubes = 0;
    var addCubePart = () => {
        var size = Math.random() * 0.5;
        var cube = {
            mesh: new THREE.Mesh(new THREE.BoxGeometry(size, size, size, 1, 1, 1), new THREE.MeshBasicMaterial({ color: colorPool[numCubes] })),
            speed: 1 / 805,
            cubeNum: numCubes,
            dist: Math.random() * 4 + 1 + size
        };
        setCubePos(cube,0,sphere);
        scene.add(cube.mesh);
        sphere.cubes.push(cube);
    }
    spherePool.push(sphere);
    
    var addcubesfunc = setInterval(() => {
        if (numCubes >= cubesPerSphere) {
            clearInterval(addcubesfunc);
        }
        addCubePart();
        numCubes++;
    }, 10);
}

export var updateSpheres = (currentTime) => {
    spherePool.forEach(sphere => {
        sphere.mesh.position.x += Math.sin(currentTime * sphere.spheremoveSpeed) / 15;
        sphere.mesh.position.y += Math.cos(currentTime * sphere.spheremoveSpeed) / 15;
        for (let i = 0; i < sphere.cubes.length; i++) {
            setCubePos(sphere.cubes[i],currentTime,sphere);
        }
    });
}