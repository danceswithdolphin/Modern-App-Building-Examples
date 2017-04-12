var points = [];
points [0] = '0,0';
points [1] = '1,1';
points [2] = '2,2';
points [3] = '3,3';
var v = [];
var top = points.length;
for (var i=0; i<top; i++){
  //console.log(points[i]);
  v= points[i].split(',');
  console.log (v[0]+','+v[1] + ' ' + (parseInt( v[0]) + parseInt( v[1] )));
}
