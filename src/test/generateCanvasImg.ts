import { createCanvas } from 'canvas';
import { rightArithShift } from 'mathjs';



const preprocessMathmeshObj = function(verts:any){
    let vertices:any[] =  Array.from(verts.vertices);
    vertices = vertices.filter(function(_, i) {
      return (i + 1) % 3;
    });
    
    let triangles :any= [];
    let maxx = Number. MIN_SAFE_INTEGER;
    let maxy = Number. MIN_SAFE_INTEGER;
    let miny = Number. MAX_SAFE_INTEGER;
    const widthLeftPadding = 10;
    const xScale = 25;
    const yScale = -xScale;
    for (let i = 0; i < vertices.length; i=i+2) {
      vertices[i]=xScale*vertices[i]+widthLeftPadding;
      if(vertices[i]>maxx)maxx=vertices[i];
    }
    for (let i = 1; i < vertices.length; i=i+2) {
      vertices[i]=yScale*vertices[i];
      if(vertices[i]>maxy)maxy=vertices[i];
      if(vertices[i]<miny)miny=vertices[i];
    }
  
    for (let i = 0; i < vertices.length; i=i+6) {
      let p1 = [ vertices[i], vertices[i+1]];
      let p2 = [ vertices[i+2], vertices[i+3]];
      let p3 = [ vertices[i+4], vertices[i+5]];
      let tri = [p1,p2,p3]; 
      triangles.push(tri);
    }
  
    return {triangles:triangles,maxx:maxx,maxy:maxy,miny:miny }
  }

 export function drawMathMeshWithBoundingBox(verts:any,bbox:any) {
    const mathmeshObj = preprocessMathmeshObj(verts);
    const triangles = mathmeshObj.triangles;
    const maxx = mathmeshObj.maxx;
    const maxy = mathmeshObj.maxy;
    const miny = mathmeshObj.miny;
  
    //creates the html canvas object
    const heightPadding = 500;
    const widthPadding = 50;
    const canvas = createCanvas(maxx + widthPadding, maxy - miny + heightPadding);
    const context = canvas.getContext("2d");
  
    context.beginPath();
  
  
  
    if(bbox.vertices.length>0)
    {
      const trianglesbbox = preprocessMathmeshObj(bbox).triangles;
      context.strokeStyle = 'green';
      context.lineWidth = 1;
      // 1------2
      // |      |
      // 0------3
      // bbox trianlges: [0, 2, 1, 3, 2, 0],
  
   
      trianglesbbox.forEach((tri: number[][] ,i: number)=> {
        if(i%2==0)
        {
          // drawing 0 -> 1 -> 2 from [0, 2, 1,]
          context.moveTo(tri[0][0], tri[0][1] + heightPadding / 2 + (maxy - miny) / 2);
          context.lineTo(tri[2][0], tri[2][1] + heightPadding / 2 + (maxy - miny) / 2);
          context.lineTo(tri[1][0], tri[1][1] + heightPadding / 2 + (maxy - miny) / 2);
        }
        else
        {
          // drawing 0 -> 3 -> 2 from [3, 2, 0]
          context.moveTo(tri[2][0], tri[2][1] + heightPadding / 2 + (maxy - miny) / 2);
          context.lineTo(tri[0][0], tri[0][1] + heightPadding / 2 + (maxy - miny) / 2);
          context.lineTo(tri[1][0], tri[1][1] + heightPadding / 2 + (maxy - miny) / 2);
        }
          
      });
      context.stroke();
    }
    
  
    context.beginPath();
    triangles.forEach((tri: number[][]) => {
        context.moveTo(tri[0][0], tri[0][1] + heightPadding / 2 + (maxy - miny) / 2);
        context.lineTo(tri[1][0], tri[1][1] + heightPadding / 2 + (maxy - miny) / 2);
        context.lineTo(tri[2][0], tri[2][1] + heightPadding / 2 + (maxy - miny) / 2);
        context.lineTo(tri[0][0], tri[0][1] + heightPadding / 2 + (maxy - miny) / 2);
    });
  
  
  
    context.fillStyle = "#000000";
    context.fill();
    return canvas.toBuffer();
  
  
  };
export  function drawMathmesh(input:string, verts:any ) {

    const mathmeshObj = preprocessMathmeshObj(verts);
    const triangles :any= mathmeshObj.triangles;
    const maxx = mathmeshObj.maxx;
    const maxy = mathmeshObj.maxy;
    const miny = mathmeshObj.miny;

    //creates the html canvas object
    const heightPadding = 500;
    const widthPadding = 50;
    const canvas = createCanvas(maxx + widthPadding, maxy - miny + heightPadding);
    const context = canvas.getContext("2d");

    // if you want raw text with it
    // const fontSetting = "25px Impact";
    // context.font = fontSetting;
    // const textWidth = context.measureText(input).width;
    // if (textWidth + widthPadding > canvas.width)
    //     canvas.width = textWidth + widthPadding;
    // context.font = fontSetting;
    // context.fillText(input, widthPadding, 50, textWidth + widthPadding);
    // context.fillStyle = "black";


    context.beginPath();
    triangles.forEach( (tri: number[][]) => {
        context.moveTo(tri[0][0], tri[0][1] + heightPadding / 2 + (maxy - miny) / 2);
        context.lineTo(tri[1][0], tri[1][1] + heightPadding / 2 + (maxy - miny) / 2);
        context.lineTo(tri[2][0], tri[2][1] + heightPadding / 2 + (maxy - miny) / 2);
        context.lineTo(tri[0][0], tri[0][1] + heightPadding / 2 + (maxy - miny) / 2);
    });



    context.fillStyle = "#000000";
    context.fill();
    //return a buffer (binary data) instead of the image itself
    return canvas.toBuffer();
};


export class generateCanvasImgObj{
    public rawstr :string;
    public vertices :any[];
    public bboxvertices :any;

    constructor(rawstr: string, vertices:any[]);
    constructor(rawstr: string, vertices:any[], bboxvertices?: any) {
        this.rawstr=rawstr;
        this.vertices=vertices;
        if(bboxvertices)
        {
            this.bboxvertices=bboxvertices;
        }
    }
    objdrawMathMeshWithBoundingBox(){
        // const self=this;
        // return () =>{
            return drawMathMeshWithBoundingBox(this.vertices,this.bboxvertices);
        // }
     
    }
  
    objdrawMathmesh () { 
        // return () => {
            return drawMathmesh(this.rawstr,this.vertices);
        // }
       
    };
  
}



