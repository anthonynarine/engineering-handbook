// Orthographic 3D rotation keeps text upright while nodes orbit through real depth.
export type Vector3={x:number;y:number;z:number};
export type Orbit={yaw:number;pitch:number};
export const defaultOrbit:Orbit={yaw:0,pitch:0};
export function rotate(point:Vector3,orbit:Orbit):Vector3{
 const cy=Math.cos(orbit.yaw),sy=Math.sin(orbit.yaw),cp=Math.cos(orbit.pitch),sp=Math.sin(orbit.pitch);
 const x=point.x*cy+point.z*sy,z=-point.x*sy+point.z*cy;
 return {x,y:point.y*cp-z*sp,z:point.y*sp+z*cp};
}
export function unrotate(point:Vector3,orbit:Orbit):Vector3{
 const cp=Math.cos(orbit.pitch),sp=Math.sin(orbit.pitch),cy=Math.cos(orbit.yaw),sy=Math.sin(orbit.yaw);
 const y=point.y*cp+point.z*sp,z=-point.y*sp+point.z*cp;
 return {x:point.x*cy-z*sy,y,z:point.x*sy+z*cy};
}
export function spherePoint(point:{x:number;y:number},index:number):Vector3{
 const x=point.x-500,y=point.y-370;
 return {x,y,z:Math.sqrt(Math.max(0,300*300-x*x-y*y))*(index%3===0?-1:1)};
}
