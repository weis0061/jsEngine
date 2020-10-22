import * as vmath from './math.js';
import * as math from 'mathjs';
//import { addSphere, updateSpheres } from './spheres.js';
var regl=require('regl')();
var Fps = 60;
var framerate=1/Fps;
var framerateMs=framerate*1000;
var currentTime = 0;
var camera ={fov:90, aspectRatio: window.innerWidth / window.innerHeight,
     near: 0.01, far: 2000,
     position:[0.0,0.0,0.0],
     rotation:[0,0,0,1]};
var leadingCamera={fov:90,position:[0,0,0],rotation:[0,0,0,1]}
camera.position[2]=0.0;
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
handReader.src="handtracker_local.html";
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

                handpositions=[indexFinger[0][0]/vid.scrollWidth,indexFinger[0][1]/vid.scrollHeight,indexFinger[0][2]/50];
                });
                leadingCamera.position=handpositions;
              }
           },32);
    }
}

var inputLoop=(key)=>{
    switch(key){
        case "w":
        case "ArrowUp":leadingCamera.position[1]+=framerate*3;break;
        case "s":
        case "ArrowDown":leadingCamera.position[1]-=framerate*3;break;
        case "-":leadingCamera.position[2]+=framerate*3;break;
        case "+":leadingCamera.position[2]-=framerate*3;break;
        case "a":
        case "ArrowRight":leadingCamera.position[0]+=framerate*3;break;
        case "d":
        case "ArrowLeft":leadingCamera.position[0]-=framerate*3;break;
    }
};
var keysDown=[];
window.addEventListener('keydown',(e)=>{
    if(!keysDown.some(x=>x==e.key))
    keysDown.push(e.key)
});
window.addEventListener('keyup',e=>{
    keysDown.splice(keysDown.indexOf(e.key),1);
});
window.addEventListener('wheel',(e)=>{
    leadingCamera.position[2]+=e.deltaY/60*60;
});
window.addEventListener('mousemove',(e)=>{
    leadingCamera.rotation[0]-=e.movementY/60/window.innerHeight*333;
    leadingCamera.rotation[1]-=e.movementX/60/window.innerWidth*333;
});
window.addEventListener('blur',e=>{
    keysDown=[];
});


//timing
function step(){
    keysDown.forEach(k=>inputLoop(k));
    /*
    camera.position=leadingCamera.position;
    leadingCamera.position=[math.sin(currentTime), math.cos(currentTime), 1];*/
    var pos = vmath.smoothStep(camera.position, leadingCamera.position, 25 * framerate);

    var out=[0,0,0,1];
    vmath.slerp(out, leadingCamera.rotation, camera.rotation, framerate);
    camera.rotation=out;
    currentTime += framerateMs;
}

var world=require('./world');
world.addCube([0.5,0.5,0.5],[0.2,0.3,0.5]);
//#region render
var vertexIds=[];
var verts=[];
for(var i=0;i<world.triCount;i++){
    vertexIds.push(i*3);
    vertexIds.push(i*3+1);
    vertexIds.push(i*3+2);
    verts.push(world.tris[i]);
}
verts=flattenMatrix(verts);
var glsl=x=>x;
var graphics=require('./graphics');
import {declaration,vertexDeclaration,transformPolysToCamera, fragDeclaration} from './graphics';
var reglCompiled=0;
const drawCall=(props)=>{
    //calling this is laggy

    if(reglCompiled) return reglCompiled(props);
    else reglCompiled=regl({
            frag:fragDeclaration+ graphics.drawPosition,
            vert:declaration+vertexDeclaration+glsl`uniform vec3 indexFinger;`+transformPolysToCamera+ glsl`void main(){
            position3d=position.xyz+indexFinger.xyz;
            gl_Position=transformPolysToCamera();
        }`,
        attributes:{
            VertexID:regl.buffer(vertexIds),
            position: regl.buffer(verts)
        },
            
        uniforms:{
            color:regl.prop('color'),
            matrix_mv:regl.prop('matrix_mv'),
            indexFinger:regl.prop('indexFinger')
        },
        count:world.triCount*3,
        primitive:"triangles",
    });
    console.info("regl compiled");
    return reglCompiled(props);
}
var getViewProjectionMatrix=(camera)=>{
   var mv=math.multiply(graphics.identity(),graphics.createTranslationMatrix(camera.position));
   mv=math.multiply(graphics.rotationAroundXMatrix(camera.rotation[0]),mv);
   mv=math.multiply(graphics.rotationAroundYMatrix(camera.rotation[1]),mv);
   mv=math.multiply(graphics.rotationAroundZMatrix(camera.rotation[2]),mv);
   var znear=0.01;
   var zfar=100.0;
   var aspect=window.innerWidth / window.innerHeight;
   var fov=90;
   var p=[
    [1/(aspect/tan(fov)),0,0,0],
    [0,1/tan(fov/2),0,0],
    [0,0,-(zfar+znear)/(zfar-znear),-(2*zfar*znear/(zfar-znear))],
    [0,0,-1,0]];
    mv=math.multiply(p,mv);
    return mv;
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

import {flattenMatrix} from './graphics';
import { tan } from 'mathjs';
var lastSync=currentTime;
regl.frame(()=>{
    //if the fps is lower and we're ready too early, skip drawing
    if(lastSync+framerateMs>currentTime) return;
    lastSync=currentTime;

    regl.clear({
        color:[0.0,0.0,0.0,0.0],
        depth:1
    });

    drawCall({
        color:[1,0,0,1],
        matrix_mv:flattenMatrix(getViewProjectionMatrix(camera)),
        indexFinger:handpositions
    });
});
//#endregion
