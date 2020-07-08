import * as vmath from './math.js';
import * as math from 'mathjs';
const {Matrix} = require('ml-matrix');
//import { addSphere, updateSpheres } from './spheres.js';
var regl=require('regl')();
var Fps = 35;
var framerate=1/Fps;
var framerateMs=framerate*1000;
var currentTime = 0;
var camera ={fov:90, aspectRatio: window.innerWidth / window.innerHeight,
     near: 0.01, far: 2000,
     position:[0.0,0.0,5.0],
     rotation:[0,0,0,1]};
var leadingCamera={fov:90,position:[0,0,0],rotation:[0,0,0,1]}
camera.position[2]=5;
window.addEventListener('resize',(ev) => {
    camera.aspectRatio = window.innerWidth / window.innerHeight;
})
var stepInterval=setInterval(step, framerateMs);
window.focused=true;
window.onblur=(e)=>{
    window.focused=false;
    clearInterval(stepInterval);
    stepInterval = setInterval(step, 3000);
}
window.onfocus=(e)=>{
    console.log("focus")
    window.focused=true;
    clearInterval(stepInterval);
    stepInterval = setInterval(step, framerateMs);
}
var handpositions=[0.0,0.0,0.0];
var handReader=document.createElement("iframe");
handReader.src="handtracker_webrtc.html";
document.body.appendChild(handReader);
handReader.onload=(e)=>{
    // reference to document in iframe
    var vid = (handReader.contentDocument? handReader.contentDocument: handReader.contentWindow.document).getElementById('remoteVideo');
    vid.onloadedmetadata=()=>{
        var isComputing=false;
        setInterval(() => {
           if(isComputing===false && window.focused){
              isComputing=true;
              vid.getHands().then(hands=>{
                isComputing=false;
                
                if(!hands[0])return;
                var indexFinger = hands[0].annotations.indexFinger;

                handpositions=[indexFinger[0][0],indexFinger[0][1],indexFinger[0][2]];
                console.log(handpositions);

                leadingCamera.rotation[1]=indexFinger[0][1]/100;
                leadingCamera.rotation[2]=indexFinger[0][2]/100;
                });
              }
           },32);
    }
}

window.addEventListener('keydown',(e)=>{
    switch(e.key){
        case "ArrowUp":leadingCamera.position[1]+=framerate*30;break;
        case "ArrowDown":leadingCamera.position[1]-=framerate*30;break;
        case "-":leadingCamera.position[2]+=framerate*30;break;
        case "+":leadingCamera.position[2]-=framerate*30;break;
        case "ArrowRight":leadingCamera.position[0]+=framerate*30;break;
        case "ArrowLeft":leadingCamera.position[0]-=framerate*30;break;
    }
    console.log(leadingCamera.position);
});
window.addEventListener('wheel',(e)=>{``
    leadingCamera.position[2]+=e.deltaY/60*60;
});
window.addEventListener('mousemove',(e)=>{
    leadingCamera.rotation[0]-=e.movementY/60/window.innerHeight*30;
    leadingCamera.rotation[1]-=e.movementX/60/window.innerWidth*30;
});


//timing
function step(){
    leadingCamera.position=[math.sin(currentTime), math.cos(currentTime), 1];
    leadingCamera.rotation=[math.sin]
    var pos = vmath.smoothStep(vmath.vec2array(camera.position), leadingCamera.position, 25 * framerate);
    camera.position.x = pos[0];
    camera.position.y = pos[1];
    camera.position.z = pos[2];
    var out=[0,0,0,1];
    vmath.slerp(out,leadingCamera.rotation,camera.rotation, framerate);
    camera.rotation=out;
    currentTime += framerateMs;
}


//#region render
var glsl=x=>x;
var graphics=require('./graphics');
import {declaration,vertexDeclaration,transformPolysToCamera, fragDeclaration} from './graphics';
var drawCall=regl({
    frag:graphics.raycastSpheres,
    vert:declaration+vertexDeclaration+transformPolysToCamera+ glsl`void main(){gl_Position=transformPolysToCamera(); position3d=transformPolysToCamera().xyz;}`,
    attributes:{
        VertexID:regl.buffer([0,1,2,3]),
        position: regl.buffer([
            1,1,
            -1,1,
            -1,-1,
            1,-1])
    },
        
    uniforms:{
        color:regl.prop('color'),
        matrix_mv:regl.prop('matrix_mv')
    },
    count:4,
    primitive:"triangle fan",
});
var getViewProjectionMatrix=()=>{
    var xaxis=[math.cos(camera.rotation[1]), 0, -math.sin(camera.rotation[1])];
    var yaxis=[math.sin(camera.rotation[1])*math.sin(camera.rotation[0]),math.cos(camera.rotation[0]), math.cos(camera.rotation[1])*math.sin(camera.rotation[0])];
    var zaxis=[math.sin(camera.rotation[1])*math.cos(camera.rotation[0]), -math.sin(camera.rotation[0]), math.cos(camera.rotation[0])*math.cos(camera.rotation[1])];
    return [
        [xaxis[0],yaxis[0],zaxis[0],0],
        [xaxis[1],yaxis[1],zaxis[1],0],
        [xaxis[2],yaxis[2],zaxis[2],0],
        [-math.dot(xaxis,camera.position), -math.dot(yaxis,camera.position), -math.dot(zaxis,camera.position), 1]
    ];
}
var getFlatViewProjectionMatrix=()=>{
    var mvp=getViewProjectionMatrix();
    var flatVP=[];
    mvp.forEach(row=>{
        flatVP=flatVP.concat(row);
    });
    return flatVP;
}

regl.frame(()=>{
    regl.clear({
        color:[0.3,0.8,0.9,0],
        depth:1
    });
    drawCall({
        color:[1,0,0,1],
        matrix_mv:getFlatViewProjectionMatrix()
    });
});
//#endregion
