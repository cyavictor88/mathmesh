// import * as mathjs from 'mathjs';
import {Matrix , multiply, identity,index ,matrix} from 'mathjs';

// var cjson = require('../ubuntu-r.json');
// var cjson = require('./assets/julia-r.json');
import  cjson from './assets/julia-r-cleaned.json' ;
// const cjson= JSON.parse(cjsonstr)
// import cjson from './assets/julia-r.json';
// var cjson=juliar;
// var cjson={2:3};



type TMeshJson = {
    char: string;
    uni: string;
    verts: number[];
    tris: number[];
    bbox: [number, number, number, number];

};

export type TBbox = {
    minx: number;
    maxx: number;
    miny: number;
    maxy: number;
}

export enum TypeMesh {
    TMChar=0,
    TMbbox=1,
    TMmfrac=2,
} 

let dashkey = ("U+" + "-".charCodeAt(0).toString(16).padStart(4, "0")) as string;

interface cjsoninfo {
    name: keyof typeof cjson;
    x: Array<number>;
    y: Array<number>;
    type: string;
    mode: string;
}






export class MathMlStringMesh {
    public mString: string;
    public jsonMeshes: TMeshJson[];
    stringBoundingBox: { x0: number, x1: number, y0: number, y1: number };
    scale:number;
    meshtype:TypeMesh;

    finalVertexArr:any[];
    hasMesh:boolean;
    // dashMesh: TMeshJson[];

    constructor(mString: string,  box: { x0: number, x1: number, y0: number, y1: number },scale:number,meshtype:TypeMesh) {
        this.scale=scale;
        this.stringBoundingBox = box;
        this.mString = mString;
        this.jsonMeshes = [];
        this.meshtype=meshtype;
        this.finalVertexArr=[];
        this.hasMesh = true;

        if(meshtype==TypeMesh.TMmfrac)
        {
            let key = "MFRACMID";
            let xlen= (box.x1-box.x0);
            let ylen=0.1;
            let ystart=-0.;
            let xstart=0;
            let newmesh: TMeshJson = {
                char: '-',
                uni: key,
                verts: [xstart, ystart, 0, xstart, ystart + ylen, 0, xstart+xlen, ystart + ylen, 0, xstart+xlen, ystart, 0],
                // tris: [0, 1, 2, 3, 0, 2], //clockwise
                tris: [0, 2, 1, 3, 2, 0], //counter-clockwise
                // 1------2
                // |      |
                // 0------3
                bbox: [0, 0, 0, 0]
            };
            this.jsonMeshes.push(newmesh);
            return;
        }
        if(meshtype==TypeMesh.TMbbox)
        {

            let key = "TTBOX";
            let xlen= (box.x1-box.x0);
            let ylen=box.y1-box.y0;
            let ystart=-0.;
            let xstart=0;
            let newmesh: TMeshJson = {
                char: 'D',
                uni: key,
                verts: [xstart, ystart, 0, xstart, ystart + ylen, 0, xstart+xlen, ystart + ylen, 0, xstart+xlen, ystart, 0],
                tris: [0, 2, 1, 3, 2, 0],
                // 1------2
                // |      |
                // 0------3
                bbox: [0, 0, 0, 0]
            };
            this.jsonMeshes.push(newmesh);
            return;
        }

        // will break things tho// let spacescode = ["0020","00a0","1680","180e","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","200a","200b","202f","205f","3000","feff"]
        // let spaces_or_null_code = ["00a0","0020","2061"];

        // for (let i = 0; i < mString.length; i++) {

        
            // when see \\vec change the string to ⇀ 
            let dizcode=mString[0].charCodeAt(0).toString(16).padStart(4, "0");
            if (dizcode==="20d7") { 
                mString='⇀';
                dizcode = mString[0].charCodeAt(0).toString(16).padStart(4, "0"); 
            }
        
            // →  //⇀


            if (dizcode==="00a0"){this.hasMesh=false; return;} //NO-BREAK SPACE
            if (dizcode==="0020"){this.hasMesh=false; return;} //normal space
            if (dizcode==="2061"){this.hasMesh=false; return;} //null 
            let key = "U+" + dizcode;
            let newmesh: TMeshJson = {
                char: mString[0],
                uni: key,
                verts: (((cjson[key as keyof typeof cjson] as any).verts) as number[]).map(x=>x),
                tris: (cjson[key as keyof typeof cjson] as any).tris,
                bbox: [0, 0, 0, 0]
            };
            this.jsonMeshes.push(newmesh);
            
            let spaceMeshExample = false;
            if(spaceMeshExample)
            {
                let key = "USPACE";
                let xlen=0.6;
                let ylen=1.2;
                let ystart=-0.3;
                let xstart=0;
                let newmesh: TMeshJson = {
                    char: mString[0],
                    uni: key,
                    verts: [xstart, ystart, 0, xstart, ystart + ylen, 0, xstart+xlen, ystart + ylen, 0, xstart+xlen, ystart, 0],
                    tris: [0, 1, 2, 3, 0, 2],
                    bbox: [0, 0, 0, 0]
                };
                this.jsonMeshes.push(newmesh);
            }

        // };

        let xoffset = 0;
        for (let i = 0; i < this.jsonMeshes.length; i++) {
            let maxx = Number.MIN_SAFE_INTEGER;
            let maxy = Number.MIN_SAFE_INTEGER;
            let minx = Number.MAX_SAFE_INTEGER;
            let miny = Number.MAX_SAFE_INTEGER;
            let verts = this.jsonMeshes[i].verts;
            for (let j = 0; j < verts.length; j += 3) {
                verts[j] += xoffset;
                if (verts[j] > maxx) maxx = verts[j];
                if (verts[j] < minx) minx = verts[j];
                if (verts[j + 1] > maxy) maxy = verts[j + 1];
                if (verts[j + 1] < miny) miny = verts[j + 1];
            }
            this.jsonMeshes[i].bbox = [minx, maxx, miny, maxy];
            xoffset = maxx;
        }



    };


    public getBbox(verts: number[]): TBbox {
        let maxx = Number.MIN_SAFE_INTEGER;
        let maxy = Number.MIN_SAFE_INTEGER;
        let minx = Number.MAX_SAFE_INTEGER;
        let miny = Number.MAX_SAFE_INTEGER;
        for (let j = 0; j < verts.length; j += 3) {
            if (verts[j] > maxx) maxx = verts[j];
            if (verts[j] < minx) minx = verts[j];
            if (verts[j + 1] > maxy) maxy = verts[j + 1];
            if (verts[j + 1] < miny) miny = verts[j + 1];
        }
        let res: TBbox = {
            minx: minx,
            maxx: maxx,
            miny: miny,
            maxy: maxy,
        };
        return res;
    };

    public getSpatialTransArr(posArray: number[], trans: { x: number, y: number, z: number }, scale: { x: number, y: number, z: number }): number[] {
       
        let transMat = multiply(identity(4), scale.x) as Matrix;
        transMat.subset(index([0, 1, 2], [3]), [[trans.x], [trans.y], [trans.z]]);
        var transedPoses:any[] = [];

        for (let i = 0; i < posArray.length; i += 3) {
            let tmpmat = multiply(transMat, matrix([[posArray[i]], [posArray[i+1]], [posArray[i+2]],[1] ])) as Matrix;
            for (let j = 0; j < 3; j++)
            {
                transedPoses.push(  tmpmat.get([j, 0]) as number);
            }

        }
        return transedPoses;
    }


    public toTransedMesh() {

        
        let trans = { x: this.stringBoundingBox.x0, y: this.stringBoundingBox.y0 , z: 0 };
        // var scale = { x: (this.stringBoundingBox.x1 - this.stringBoundingBox.x0), y: (this.stringBoundingBox.y1 - this.stringBoundingBox.y0), z: 1 };
        var scale = { x: this.scale, y: this.scale, z: this.scale };
        for (let i = 0; i < this.jsonMeshes.length; i++) {
            let vertexData : {"positions": number[], "indices":number[] } =  {"positions": [], "indices":[] } 

            let newTransedPos = this.getSpatialTransArr(this.jsonMeshes[i].verts, trans, scale);


            vertexData["positions"] = newTransedPos;
            vertexData["indices"] = this.jsonMeshes[i].tris;

            this.finalVertexArr.push(vertexData);


        };


        return this.finalVertexArr;



    }


    
};





export * as MathText from './mathml2mesh';
