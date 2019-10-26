import * as vmath from './math.js';
import { addSphere, updateSpheres } from './spheres.js';
var regl=require('regl')();
var Fps = 35;
var framerate=1/Fps;
var framerateMs=framerate*1000;
var currentTime = 0;
var camera ={fov:90, aspectRatio: window.innerWidth / window.innerHeight, near: 0.01, far: 2000,position:[0,0,5],rotation:[0,0,0,1]};
var leadingCamera={fov:90,position:[0,0,5],rotation:[0,0,0,1]}
camera.position[2]=5;
window.addEventListener('resize',(ev) => {
    camera.aspectRatio = window.innerWidth / window.innerHeight;
})


setInterval(() => {
    updateSpheres(currentTime);
}, framerateMs);
//addSphere(0xffaaaa,scene);

window.addEventListener('keydown',(e)=>{
    switch(e.key){
        case "ArrowUp":camera.position.y+=framerate;break;
        case "ArrowDown":camera.position.y-=framerate;break;
        case "-":camera.position.z+=framerate;break;
        case "+":camera.position.z-=framerate;break;
        case "ArrowRight":camera.position.x+=framerate;break;
        case "ArrowLeft":camera.position.x-=framerate;break;
    }
});
window.addEventListener('wheel',(e)=>{
    leadingCamera.position[2]+=e.deltaY/60*60;
});
window.addEventListener('mousemove',(e)=>{
    leadingCamera.rotation[0]-=e.movementY/60/window.innerHeight*30;
    leadingCamera.rotation[1]-=e.movementX/60/window.innerWidth*30;
});


//timing
setInterval(() => {
    var pos = vmath.smoothStep(vmath.vec2array(camera.position), leadingCamera.position, 25 * framerate);
    camera.position.x = pos[0];
    camera.position.y = pos[1];
    camera.position.z = pos[2];
    var out=[0,0,0,1];
    //console.log(camera.quaternion.toArray());
    //console.log(leadingCamera.rotation);
    vmath.slerp(out,leadingCamera.rotation,camera.rotation, framerate);
    camera.rotation=out;
    /*
    regl.frame(() => {
        //renderer.render(scene, camera);//replace this
        regl({
        attributes:{
            position: regl.buffer([
                1,1,
                -1,1,
                -1,-1,
                1,-1])
            },
            uniforms:{
                color:regl.prop('color')
            }
        });
    });*/
    currentTime += framerateMs;
}, framerateMs);


//#region render
var glsl=x=>x;

var vertdecl=glsl`
    attribute vec2 position;`
var fragdecl=glsl`
    uniform vec4 color;`
var decl=glsl`
    precision mediump float;
    varying vec2 uv;`

var drawCall=regl({
    frag:
    decl+
    fragdecl+
    glsl`void main() {
    float x=uv.x;
  gl_FragColor = color;
  gl_FragColor.x=x;
}`,
    vert:
    decl+
    vertdecl+
    glsl`
void main() {
    uv=vec2(position.x,position.y);
  gl_Position = vec4(position, 0, 1);
}`,
attributes:{
    position: regl.buffer([
        1,1,
        -1,1,
        -1,-1,
        1,-1])
    },
    
    uniforms:{
        color:regl.prop('color')
    },
    count:4,
    primitive:"triangle fan"
});

regl.frame(()=>{
    regl.clear({
        color:[0.3,0.8,0.9,0],
        depth:1
    });
    drawCall({
        color:[1,0,0,1]
    })
});
//#endregion