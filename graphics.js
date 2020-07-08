export { glsl, modInts, transpose, vertexDeclaration, fragDeclaration, declaration, uv2col, smoothUnion, sphereIntersect, raycastSpheres, setUVsOnQuad, transformPolysToCamera, drawBlack}

var glsl=x=>x;

var modInts=glsl`
/* https://stackoverflow.com/questions/33908644/get-accurate-integer-modulo-in-webgl-shader
* Returns accurate MOD when arguments are approximate integers.
*/
float modI(float a,float b) {
   float m=a-floor((a+0.5)/b)*b;
   return floor(m+0.5);
}`;
var transpose=glsl`
/*https://stackoverflow.com/a/18038495*/
mediump mat4 transpose(in highp mat4 inMatrix) {
    mediump vec4 i0 = inMatrix[0];
    mediump vec4 i1 = inMatrix[1];
    mediump vec4 i2 = inMatrix[2];
    mediump vec4 i3 = inMatrix[3];

    mediump mat4 outMatrix = mat4(
                 vec4(i0.x, i1.x, i2.x, i3.x),
                 vec4(i0.y, i1.y, i2.y, i3.y),
                 vec4(i0.z, i1.z, i2.z, i3.z),
                 vec4(i0.w, i1.w, i2.w, i3.w)
                 );

    return outMatrix;
}`;

var vertexDeclaration=glsl`
    attribute vec2 position;
    attribute float VertexID;
    varying vec3 position3d;`;
var fragDeclaration=glsl`
    uniform vec4 color;
    varying vec3 position3d;`;
var declaration=glsl`
    precision mediump float;
    varying vec2 uv;
    uniform mat4 matrix_mv;`+modInts+transpose;
var uv2col=""+glsl`vec4 uv2col(){
    return vec4(sqrt(uv.x),sqrt(uv.y),0,1);
}`;
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

var raycastSpheres=""+smoothUnion+sphereIntersect+glsl`void main(){    
    vec3 rayOrigin=vec3(0,0,0);
    vec3 rayDirection=(vec4(position3d.x,position3d.y,position3d.z,0)*matrix_mv).xyz;
    float s1=iSphere( vec3(0,0,1.0), 0.5, rayOrigin, rayDirection);
    float s2=iSphere( vec3(0,1.0,0), 0.5, rayOrigin, rayDirection);
    float s3=iSphere( vec3(1.0,0,0), 0.5, rayOrigin, rayDirection);
    float s4=iSphere( vec3(0,0,-1.0), 0.5, rayOrigin, rayDirection);
    float s5=iSphere( vec3(0,-1.0,0), 0.5, rayOrigin, rayDirection);
    float s6=iSphere( vec3(-1.0,0,0), 0.5, rayOrigin, rayDirection);
    float c=max(s1,s2);
    c=max(c,s3);
    c=max(c,s4);
    c=max(c,s5);
    c=max(c,s6)/5.0;
    c=max(opSmoothUnion(s1,s3,0.2),c);
    gl_FragColor=vec4(c,c,c,1);
}`;
var drawUvs=declaration+uv2col+glsl`void main(){gl_FragColor=uv2col();}`;
var drawBlack=declaration+glsl`void main(){gl_FragColor=vec4(0,0,0,1);}`;

raycastSpheres=
    declaration+
    fragDeclaration+
    uv2col+
    raycastSpheres;

var setUVsOnQuad=
    declaration+
    vertexDeclaration+
    glsl`
    void main() {
    gl_Position=vec4(position.x,position.y, 0, 1);
    VertexID=VertexID%4;
    if(VertexID==0.0){
        uv.x=0.0;
        uv.y=0.0;
    }
    else if(VertexID==1.0){
        uv.x=1.0;
        uv.y=0.0;
    }
    else if(VertexID==2.0){
        uv.x=1.0;
        uv.y=1.0;
    }
    else if(VertexID==3.0){
        uv.x=0.0;
        uv.y=1.0;
    }
    }`;

    var transformPolysToCamera=glsl`vec4 transformPolysToCamera(){
        return vec4(position.x,position.y,0,1)*matrix_mv;
    }`;