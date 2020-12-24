import * as vmath from './math.js';
import * as math from 'mathjs';
//import { addSphere, updateSpheres } from './spheres.js';
var world=require('./world');
var regl=require('regl')();
var Fps = 60;
var framerate=1/Fps;
var framerateMs=framerate*1000;
var currentTime = 0;
const camera ={fov:90, aspectRatio: window.innerWidth / window.innerHeight,
     near: 0.01, far: 2000,
     position:[0.0,0.0,0.0],
     rotation:[0,0,0,1]};
var leadingCamera={fov:90,position:[0,0,0],rotation:[0,0,0,1]}
var leftEyeCamera,rightEyeCamera={};
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
var outp=document.createElement("span");
outp.style.width="100vw";
outp.style.height="100vh";
outp.style.position="absolute";
document.body.appendChild(outp);

var leftVid=document.createElement("video");
var rightVid=document.createElement("video");
leftVid.style.position="fixed";
rightVid.style.position="fixed";
leftVid.style.left=0;
leftVid.style.right="50vw";
rightVid.style.left="50vw";
rightVid.style.right=0;
leftVid.style.top="44vh";
leftVid.style.bottom=0;
rightVid.style.top="44vh";
rightVid.style.bottom=0;
leftVid.style.zIndex=4;
rightVid.style.zIndex=4;
leftVid.style.width="50vw";
rightVid.style.width="50vw";
rightVid.style.height="6vh";
leftVid.style.height="6vh";
document.body.style.background="black";

var cameraLog=(x)=>{console.log(x); outp.innerText=outp.innerText+JSON.stringify(x||'')+"\n";}


handReader.src="camera.html";
document.body.appendChild(handReader);
document.body.appendChild(leftVid);
document.body.appendChild(rightVid);
window.addEventListener('click',e=>{
    if(handReader.contentWindow.stream &&!rightVid.srcObject){
        var stream=handReader.contentWindow.stream;
        leftVid.srcObject=stream;
        rightVid.srcObject=stream;
        leftVid.play();
        rightVid.play();
    }
})
handReader.onload=(e)=>{
        var isComputing=false;
        setInterval(() => {
        if(!handReader.contentWindow.getHands)return;
        var getHands=handReader.contentWindow.getHands;

           if(isComputing===false && window.focused){
              isComputing=true;
                try
                {
                    var hands=getHands();
                    {
                    isComputing=false;
                    if(!hands[0])return;
                    var indexFinger = hands[0].annotations.indexFinger;

                    handpositions=[indexFinger[0][0]/vid.scrollWidth,indexFinger[0][1]/vid.scrollHeight,indexFinger[0][2]/50];
                    cameraLog(handpositions);
                    leadingCamera.position=handpositions;
                    }
                }
                catch(err){
                    cameraLog(err);
                    isComputing=false;
                }
            }
           },32);
    setTimeout(() => {
        world.addCube(math.add(leadingCamera.position,[30.0,0.0,0.0]), [20.0,20.0,20.0] );
        world.addCube(math.add(leadingCamera.position,[0.0,30.0,0.0]), [20.0,20.0,20.0] );
        world.addCube(math.add(leadingCamera.position,[0.0,0.0,30.0]), [20.0,20.0,20.0] );
        world.addCube(math.add(leadingCamera.position,[-30.0,0.0,0.0]), [20.0,20.0,20.0] );
        world.addCube(math.add(leadingCamera.position,[0.0,-30.0,0.0]), [20.0,20.0,20.0] );
        world.addCube(math.add(leadingCamera.position,[0.0,0.0,-30.0]), [20.0,20.0,20.0] );
        cameraLog('cubes added');
    }, 5000);
}
setInterval(() => {
    var s=outp.innerText.length-100;
    if(s<0)s=0;
    outp.innerText=outp.innerText.slice(s, outp.innerText.length);
}, 10000);
handReader.style="opacity: 0.5;width:100vw;height:100vh;position:absolute";

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
    // return;
    //TODO idk why the translations arent working
    var camclone = JSON.stringify(leadingCamera);
    leftEyeCamera = JSON.parse(camclone);
    rightEyeCamera = JSON.parse(camclone);
    leftEyeCamera.position[2]=3;
    rightEyeCamera.position[2]=4;
    /*
    leftEyeCamera.position = math.multiply(leadingCamera.position, graphics.create3x3TranslationMatrix(1.0,0.0,0.0));
    rightEyeCamera.position = math.multiply(leadingCamera.position, graphics.create3x3TranslationMatrix(-1.0,0.0,0.0));*/

}

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
var reglLeftEye=0;
var reglRightEye=0;
const drawCall=(properties)=>{ 
    //calling this is laggy

    if(!reglLeftEye)
    {
        reglLeftEye=regl({
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
            primitive:"triangles",viewport:{x:0,y:0,width:window.innerWidth/2,height:window.innerHeight}
            });
        reglRightEye=regl({
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
            primitive:"triangles",viewport:{x:window.innerWidth/2,y:0,width:window.innerWidth/2,height:window.innerHeight}
            });
        console.info("regl compiled");
    }
    properties.matrix_mv=flattenMatrix(getViewProjectionMatrix(rightEyeCamera));
    reglRightEye(properties);
    properties.matrix_mv=flattenMatrix(getViewProjectionMatrix(leftEyeCamera));
    return reglLeftEye(properties);
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
        indexFinger:handpositions,
    });
});
//#endregion
