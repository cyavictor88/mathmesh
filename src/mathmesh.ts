import katex from "katex";
import { XMLParser} from "fast-xml-parser";
import { MMParser } from './mathmlParser';

export interface Geometry {
    positions: number[];
    indices: number[];
    vertices: Float32Array;
}

export interface ThreeD extends Geometry {
    //for future extensions
}

export interface TwoD extends Geometry {
    triangles: number[][][];
    aTextureCoord: number[];
    aVertexPosition: number[]; 
}

export function mathmesh(input:string):ThreeD{
    
    // input=input+"\\textrm{ }";                                                                                                                                                                  

    // use katex to transform raw latex math string to mathml
    const mathmlHtml = katex.renderToString(input, {
        throwOnError: false,
        output: "mathml",
        displayMode: true,
    });

    const xmlParser = new XMLParser({
        "preserveOrder": true,
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        allowBooleanAttributes: true,
        stopNodes: ["span.math.semantics.annotaion"]
    });
    const jsonObj = xmlParser.parse(mathmlHtml);
    const mathmlXml:[] = jsonObj[0].span[0].math[0].semantics;
    const mmp: MMParser = new MMParser(mathmlXml);
    const mesh3D: Geometry  = mmp.generateMathmesh3D();
    return mesh3D as ThreeD;
};

export function mathmesh2D(input:string): TwoD { 
    function get2D(mesh3D:Geometry): TwoD {
        // get only x,y
        const vertices2D = [...mesh3D.vertices].filter(function(_, i) {
          return (i + 1) % 3 >0;
        });
        const vertices = new Float32Array(vertices2D);
        let triangles :number[][][]= [];
        let maxx = Number. MIN_SAFE_INTEGER;
        let maxy = Number. MIN_SAFE_INTEGER;
        let miny = Number. MAX_SAFE_INTEGER;
        const widthLeftPadding = 0;
        const xScale = 25;
        const yScale = -xScale;
        for (let i = 0; i < vertices2D.length; i=i+2) {
          vertices2D[i]=xScale*vertices2D[i]+widthLeftPadding;
          if(vertices2D[i]>maxx)maxx=vertices2D[i];
        }
        for (let i = 1; i < vertices2D.length; i=i+2) {
          vertices2D[i]=yScale*vertices2D[i];
          if(vertices2D[i]>maxy)maxy=vertices2D[i];
          if(vertices2D[i]<miny)miny=vertices2D[i];
        }
      
        for (let i = 0; i < vertices2D.length; i=i+6) {
          let p1 = [ vertices2D[i], vertices2D[i+1]];
          let p2 = [ vertices2D[i+2], vertices2D[i+3]];
          let p3 = [ vertices2D[i+4], vertices2D[i+5]];
          let tri = [p1,p2,p3]; 
          triangles.push(tri);
        }
    
        const scale =25;
        const max_positionY = Math.max( ...mesh3D.positions.filter((x,i)=>(i+1)%3==2) );
        const positions = mesh3D.positions.filter((_,i)=>(i+1)%3!=0)
        const aVertexPosition = positions.map((p,i)=>i%2==0?scale*p:scale*(max_positionY-p));
        const maxAVertexPositionX = Math.max( ...aVertexPosition.filter((_,i)=>i%2==0));
        const maxAVertexPositionY = Math.max( ...aVertexPosition.filter((_,i)=>i%2==1));
        const aTextureCoord = aVertexPosition.map((p,i)=>i%2==0?p/maxAVertexPositionX:p/maxAVertexPositionY);
      
        return {vertices,indices:mesh3D.indices,positions,triangles,aVertexPosition,aTextureCoord }
    }
    const mesh3D = mathmesh(input);
    return get2D(mesh3D);
}

export function mathmeshBoxAtLevel(input:string,lvl:number):{positions:number[],indices:number[],vertices:Float32Array} {
    
    // input=input+"\\textrm{ }";

    // use katex to transform raw latex math string to mathml
    var html = katex.renderToString(input, {
        throwOnError: false,
        output: "mathml",
        displayMode: true,
    });
   // console.log(html);
    var options = {
        "preserveOrder": true,
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        allowBooleanAttributes: true,
        stopNodes: ["span.math.semantics.annotaion"]
    };
    const parser = new XMLParser(options);
    let jObj = parser.parse(html);
    var mml:[] = jObj[0].span[0].math[0].semantics;

    let mmp: MMParser = new MMParser(mml);
    let verts:{positions:number[],indices:number[],vertices:Float32Array}  = mmp.generateBoundingBoxAtLevel(lvl);
    return verts;



};