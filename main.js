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


setInterval(() => {
    //updateSpheres(currentTime);
}, framerateMs);
//addSphere(0xffaaaa,scene);

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

var vertexDeclaration=glsl`
    attribute vec2 position;
    attribute float VertexID;`;
var fragDeclaration=glsl`
    uniform vec4 color;`;
var declaration=glsl`
    precision mediump float;
    varying vec2 uv;
    uniform mat4 matrix_mv;`;
var uv2col=""+glsl`vec4 uv2col(){
    return vec4(sqrt(uv.x),sqrt(uv.y),0,1);
}`;
var matrix_model2world=glsl``;
var smoothUnion=glsl`float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); }`;
var sphereIntersect=glsl`float iSphere(vec3 spherePos, float sphereRadius, vec3 rayOrigin, vec3 rayDirection )
{
    vec3 oc = rayOrigin - spherePos;
    float b = dot(rayDirection, oc);
    float c = dot(oc, oc) - sphereRadius*sphereRadius;
    float t = b*b - c;
    if( t > 0.0) 
        t = -b - sqrt(t);
    return t;
}`;
var fragShader=""+smoothUnion+sphereIntersect+glsl`void main(){    
    vec3 rayOrigin=(vec3(gl_FragCoord.x/500.0-0.5,gl_FragCoord.y/500.0-0.5,1)).xyz+matrix_mv[3].xyz;
    vec3 rayDirection=(vec4(0,0,1,1)*matrix_mv).xyz;
    float s1=iSphere( vec3(0,0,1.0), 0.5, rayOrigin, rayDirection);
    float s2=iSphere( vec3(0,1.0,0), 0.5, rayOrigin, rayDirection);
    float s3=iSphere( vec3(1.0,0,0), 0.5, rayOrigin, rayDirection);
    float s4=iSphere( vec3(0,0,-1.0), 0.5, rayOrigin, rayDirection);
    float s5=iSphere( vec3(0,-1.0,0), 0.5, rayOrigin, rayDirection);
    float s6=iSphere( vec3(-1.0,0,0), 0.5, rayOrigin, rayDirection);
    float c=opSmoothUnion(s1,s2,0.5);
    c=max(s1,s2);
    c=max(c,s3);
    c=max(c,s4);
    c=max(c,s5);
    c=max(c,s6)/5.0;
    //c=matrix_mv[3].x;
    gl_FragColor=vec4(c,c,c,1);
}`;


fragShader=
    declaration+
    fragDeclaration+
    uv2col+
    fragShader;

console.log(fragShader);

var vertShader=
    declaration+
    vertexDeclaration+
    glsl`
    void main() {
    //gl_Position = vec4(VertexID,VertexID, 0, 1);
    gl_Position=vec4(position.x,position.y, 0, 1);
    uv.x=VertexID/4.0;
    uv.y=VertexID/4.0;
    }`;

var drawCall=regl({
    frag:fragShader,
    vert:vertShader,
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
var getMVP=()=>{
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
var getFlatMVP=()=>{
    var mvp=getMVP();
    var flatMVP=[];
    mvp.forEach(row=>{
        flatMVP=flatMVP.concat(row);
    });
    return flatMVP;
}
regl.frame(()=>{
    regl.clear({
        color:[0.3,0.8,0.9,0],
        depth:1
    });
    drawCall({
        color:[1,0,0,1],
        matrix_mv:getFlatMVP()
    });
});
//#endregion