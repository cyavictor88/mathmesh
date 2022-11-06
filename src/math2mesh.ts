import katex from "katex";
import { XMLParser} from "fast-xml-parser";
import { MMParser } from './mathmlParser';


export function mathmeshObj(input:string):MMParser {
    // input=input+"\\textrm{ }";

    // use katex to transform raw latex math string to mathml
    var html = katex.renderToString(input, {
        throwOnError: false,
        output: "mathml",
        displayMode: true,
    });
   console.log(html);
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

    return mmp;

}



export function mathmesh(input:string):{positions:number[],indices:number[],vertices:Float32Array} {
    
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
    let verts:{positions:number[],indices:number[],vertices:Float32Array}  = mmp.generateMathmesh();
    return verts;



};


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