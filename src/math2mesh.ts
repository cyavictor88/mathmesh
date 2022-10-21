import katex from "katex";
import { XMLParser} from "fast-xml-parser";

import { MMParser } from './mathmlParser';




export function mathmesh(input):{positions:any[],indices:any[]} {
    // var element = document.createElement("p");
    // katex.render("zz = \\pm\\sqrt{a^2 + b^2}", element, {
    //     throwOnError: false,
    //     output: "mathml",
    //     displayMode: true
    // });
    // console.log(element);
    // var html = katex.renderToString("f(x) = \\int_{-\\infty}^\\inftyf(\\hat\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi", {
    input=input+"\\textrm{ }";

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
    var verts =mmp.putinSceneArrayWithED();
    return verts;



};