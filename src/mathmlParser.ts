import * as lodash from 'lodash';
import { MathMlStringMesh, TypeMesh } from './mathml2mesh';
import { EleDim as ED } from './EleDim';

export enum MEleType {
    Start = 0,
    Attris = 1,
    Text = 2,
}

export enum Position {
    Down = 0,
    Mid = 1,
    Up = 2
}

export enum LBlockType {
    mtable = "mtable",
    mtr = "mtr",
    mtd = "mtd",
    munderover = "munderover",
    mover = "mover",
    munder = "munder",
    msubsup = "msubsup",
    msub = "msub",
    msup = "msup",
    mfrac = "mfrac",
    msqrt = "mssqrt",
    mi = "mi",
    mo = "mo",
    mn = "mn",
    mrow = "mrow",
    mstyle = "mstyle",
    mtext = "mtext",
    mdummy = "mdummy",
    mfracmid = "mfracmid",

}
export interface MEle {
    node: string,
    lvl: number,
    type: MEleType,
    text?: string,
    attriArr?: MAttriDet[],
}

export interface MAttriDet {
    name: string,
    val: any,
}

export interface ibbox {
    xs: [number, number],
    ys: [number, number],
}


export interface OwnedDetail {
    owner: MMFlatStruct,
    tabDetail?: TabInfo,
    pos?: Position,
    counter?: number,

}


export interface TabInfo {
    colIdx: number,
    rowIdx: number,

    tab: MMFlatStruct,

}

export interface MTag {
    type: LBlockType,

    children: MTag[],
    lvl: number,
    attriArr?: MAttriDet[],
    parent?: MTag,
    text?: string,
};

export interface BlockXY {
    x0?: number,
    y0?: number,
    x1?: number,
    y1?: number,

    miny0?: number,
    maxy1?: number,
    minx0?: number,
    maxx1?: number,
    scale?: number,
}

export interface MMFlatStruct {
    lvl: number,
    type: LBlockType,


    blockxy?: BlockXY,

    text?: string,
    attriArr?: MAttriDet[],
    uuid?: string,
    closeFor?: MMFlatStruct,
    cols?: number,
    rows?: number,


    belongToTable?: MMFlatStruct,
    // colIdx?: number,
    // rowIdx?: number,


    x0?: number,
    y0?: number,
    x1?: number,
    y1?: number,


    miny0?: number,
    maxy1?: number,

    minx0?: number,
    maxx1?: number,

    scale?: number,

    brakectForTab?: boolean,

    belongArr?: MMFlatStruct[],
    tabs?: TabInfo[],
    ownedDetails?: OwnedDetail[],



    tabEdimCoords?: ED.EDim[][],

    refLblock?: LBlock,



};



export interface LBlock {
    text?: string,
    pos?: { x: number, y: number },
    parent?: LBlock,
    children?: LBlock[],
    lvl?: number,

    idxInArray: number,

    scale: number,
    type: LBlockType,
    uuid: string,

    x0?: number,
    y0?: number,
    x1?: number,
    y1?: number,


    miny0?: number,
    maxy1?: number,

    minx0?: number,
    maxx1?: number,


    tEntryH?: number,
    tEntryW?: number,

    colidx?: number,
    rowidx?: number,
    belongToTable?: MMFlatStruct,

    // start?: number,
    // end?: number,

    belongArr?: MMFlatStruct[],


    edim?: ED.EDim,
};


export class MMParser {
    public mathmlXml: Object[];
    public parsedStringArr: string[];
    public grandMTagNode: MTag;
    public meleArr: MEle[];
    public grandFlatArr: MMFlatStruct[];
    public grandFlatArrWithClose: MMFlatStruct[];
    public grandLBlockTree: LBlock;
    public tableStacksofStackY: MMFlatStruct[][];
    public tableStacksofStackX: MMFlatStruct[][];
    public tableTree: LBlock;
    public lvlStack: LBlock[];

    public uuidcnt: number;

    constructor(mathmlXml: []) {
        this.uuidcnt = 0;
        this.meleArr = [];
        this.grandFlatArr = [];
        this.grandFlatArrWithClose = [];
        this.grandMTagNode = { type: LBlockType.mdummy, children: [], lvl: -1 };
        this.mathmlXml = mathmlXml;
        this.parsedStringArr = [];
        this.tableStacksofStackX = [];
        this.tableStacksofStackY = [];



        this.assembleMEleArrByRecuOnObject("mrow", this.mathmlXml, 0, this.parsedStringArr);



        this.assembleGrandMTagNode();





        this.insertFractionHelper();



        this.assembleGrandFlatArr(this.grandMTagNode);


        this.assembleGrandFlatWithCloseArr();


        this.addRowColAttriForTablesInFlatArrs();



        this.turnGrandFlatArrToGrandLBlockTree();


        this.fillinBelongArr();



        this.assembleLvlStack(this.grandLBlockTree);


        this.fenceAdjustment();
        this.mfracAdjustment();

        this.stretchyAdjustment();



        this.alignVertically();
        // this.moveAllby(-50,5);



    }
    stretchyAdjustment() {
        for (let i = 0; i < this.grandFlatArr.length; i++) {
            let ele = this.grandFlatArr[i];
            if (ele.text!=null && ele.attriArr!=null) {
                let block = ele.refLblock;
                    ele.attriArr.forEach(element => {
                        if (element.name === 'stretchy') {
                            if (element.val === 'true') {
                                let blockidxInparentchildreslist = 0;
                                for (let j = 0; j < block.parent.children.length; j++) {
                                    if (block.uuid === block.parent.children[j].uuid)
                                        blockidxInparentchildreslist = j;
                                }



                                let dizscale = block.parent.children[blockidxInparentchildreslist - 1].edim.dim.xs[1] - block.parent.children[blockidxInparentchildreslist - 1].edim.dim.xs[0]
                                // block.edim.dim.scale=dizscale;
                                block.edim.spatialTransSingleEle({delx:0,dely:-dizscale},dizscale);
                                // block.edim.dim.xs[1]= block.parent.children[blockidxInparentchildreslist - 1].edim.dim.xs[1];
                            }
                        }
                    });
                }
            }
        }
    


        moveAllby(dx: number, dy: number){
            this.lvlStack[0].edim.spatialTrans({ delx: dx, dely: dy }, 1);
        }
        insertFractionHelper()
        {
            let curStack = [this.grandMTagNode];
            while (curStack.length > 0) {
                let item = curStack.shift();
                if (item.children != null && item.children.length > 0) {
                    for (let i = 0; i < item.children.length; i++) {
                        curStack.push(item.children[i])
                    }
                }
                if (item.type == LBlockType.mfrac)//mfracmid
                {

                    var newMTag: MTag = { type: LBlockType.mfracmid, lvl: item.children[0].lvl, children: [], text: '-' };
                    item.children.splice(0, 0, newMTag);//insert "-" at beginning so the style is same with msubsup/munderover (mid / down / up)


                    // add a space after mfrac so, the mfracmid can end properly
                    var originalItemParent = item.parent;
                    var newMTagRow: MTag = { type: LBlockType.mrow, lvl: item.lvl, children: [], parent: originalItemParent };
                    var newMTagEndSpace: MTag = { type: LBlockType.mi, lvl: item.lvl + 1, children: [], text: ' ', parent: newMTagRow };
                    var newMTagStartSpace: MTag = { type: LBlockType.mi, lvl: item.lvl + 1, children: [], text: ' ', parent: newMTagRow };
                    newMTagRow.children = [newMTagStartSpace, item, newMTagEndSpace];
                    item.parent = newMTagRow;

                    //replace item's place with the new row in parent's children list
                    for (let j = 0; j < originalItemParent.children.length; j++) {
                        const element = originalItemParent.children[j];
                        if (element == item) {
                            originalItemParent.children[j] = newMTagRow;
                            break;
                        }
                    }

                    // increase lvl by one for all children of mfracitem recursively
                    let curMfracStack = [item];
                    while (curMfracStack.length > 0) {
                        let mfracitem = curMfracStack.shift();
                        mfracitem.lvl += 1;
                        if (mfracitem.children != null && mfracitem.children.length > 0) {
                            for (let i = 0; i < mfracitem.children.length; i++) {
                                curMfracStack.push(mfracitem.children[i])
                            }
                        }
                    }

                }
            }
        }

        alignVertically(){
            // webpack console.log("vert centeringggggggggggggggggggggggggg");
            // webpack console.log(this.lvlStack[0].edim.dim.ys);
            let y1c = (this.lvlStack[0].edim.dim.ys[1] + this.lvlStack[0].edim.dim.ys[0]) / 2;

            let firstlvlchildren = this.grandLBlockTree.children;

            let mids = 0;
            let cnt = 0;

            for (let i = 0; i < firstlvlchildren.length; i++) {
                let lvl1child = firstlvlchildren[i];
                if (lvl1child.type != LBlockType.mfrac) {
                    let y0l = lvl1child.edim.dim.ys[0];
                    let y0h = lvl1child.edim.dim.ys[1];
                    let y0c = (y0l + y0h) / 2;
                    lvl1child.edim.spatialTrans({ delx: 0, dely: y1c - y0c }, 1);
                    mids += lvl1child.edim.dim.ys[1] / 2 + lvl1child.edim.dim.ys[0] / 2;
                    cnt += 1;


                }


            }

            let avgMid = (mids) / cnt;
            for (let i = 0; i < firstlvlchildren.length; i++) {
                let lvl1child = firstlvlchildren[i];
                if (lvl1child.type == LBlockType.mfrac) {
                    let dy = 0;
                    let mymid = (lvl1child.children[0].edim.dim.ys[0] + lvl1child.children[0].edim.dim.ys[1]) / 2;

                    if (avgMid > lvl1child.children[0].edim.dim.ys[1])
                        dy = avgMid - lvl1child.children[0].edim.dim.ys[1] + mymid
                    else
                        dy = avgMid - lvl1child.children[0].edim.dim.ys[0] - mymid
                    dy = avgMid - mymid;
                    lvl1child.edim.spatialTrans({ delx: 0, dely: dy }, 1);
                }
            }

            //fix bbox for root parent only
            function getBiggerbbox(bbox1: ibbox, bbox2: ibbox): ibbox {
                let minx0 = lodash.min([bbox1.xs[0], bbox2.xs[0]]);
                let miny0 = lodash.min([bbox1.ys[0], bbox2.ys[0]]);
                let maxx1 = lodash.max([bbox1.xs[1], bbox2.xs[1]]);
                let maxy1 = lodash.max([bbox1.ys[1], bbox2.ys[1]]);
                return { xs: [minx0, maxx1], ys: [miny0, maxy1] }
            }

            let bigbbox = { xs: this.grandLBlockTree.edim.dim.xs, ys: this.grandLBlockTree.edim.dim.ys };
            for (let i = 0; i < this.grandFlatArr.length; i++) {
                let ele = this.grandFlatArr[i];
                let eleibbox = { xs: ele.refLblock.edim.dim.xs, ys: ele.refLblock.edim.dim.ys };
                bigbbox = getBiggerbbox(bigbbox, eleibbox);
            }
            this.grandLBlockTree.edim.dim.xs = bigbbox.xs;
            this.grandLBlockTree.edim.dim.ys = bigbbox.ys;


            //fixing bbox


            // for (let i=0;i<this.grandFlatArr.length;i++)
            // {
            //     let ele=this.grandFlatArr[i];
            //     let y0l = ele.refLblock.edim.dim.ys[0];
            //     let y0h = ele.refLblock.edim.dim.ys[1];
            //     let y0c = (y0l+y0h)/2;
            //     // if(y1c>y0c)
            //     //     ele.refLblock.edim.spatialTransSingleEle({delx:0,dely:y1c-y0c},1);
            //     // else
            //     //    ele.refLblock.edim.spatialTransSingleEle({delx:0,dely:-(y1c-y0c)},1);
            // }

        }


        addBlockStartEndToArr() {
            let curTable: MMFlatStruct = { type: LBlockType.mdummy, lvl: -1, cols: 1, rows: 1 };
            let tableStack = [];

            let bxy: BlockXY = { x0: 0, y0: 0 };


            this.grandFlatArrWithClose.forEach((ele, idx) => {


                ele.blockxy = { x0: bxy.x0, y0: bxy.y0 };





            });


        }

        getDxDyUsingRowCol(r: number, c: number, rh: number, cw: number) {
            let dx = c * cw;
            let dy = r * rh;
            return [dx, dy];
        }
        getMinx0Miny0(table, minx0, miny0, changeminx0) {

            let tableStack = [table];

            while (tableStack.length > 0) {
                let thisTable = tableStack.pop();
                // webpack console.log("rrr");
                let entries = lodash.filter(this.grandFlatArr, function (o) {
                    return (o.belongToTable != null &&
                        o.text != null && o.belongToTable.uuid === thisTable.uuid);
                });

                // webpack console.log("qq");


                for (let i = 0; i < entries.length; i++) {
                    let sub_ele: MMFlatStruct = entries[i];
                    if (sub_ele.y0 < miny0) miny0 = sub_ele.y0;
                    if (changeminx0) {
                        if (sub_ele.x0 < minx0) minx0 = sub_ele.x0;
                    }

                }


                let haveParent = lodash.find(this.grandFlatArr, function (o) {
                    return (o.belongToTable != null &&
                        o.type == LBlockType.mtable && o.belongToTable.uuid === thisTable.uuid);
                });

                if (haveParent != null) {
                    tableStack.push(haveParent);
                }
            }
            return [minx0, miny0];



            // let miny0 = Number.MAX_SAFE_INTEGER;

            // let minx0 = Number.MAX_SAFE_INTEGER;




        }
        moveDYfromidx(r: number, c: number, newxwid: number, newyhei: number, idx: number, entriesEle: any[]) {
            const ele = this.grandFlatArr[idx];
            if (r == 0) {
                let dx = newxwid - (ele.x1 - ele.x0);
                if (dx < 0) dx = 0;
                let dy = newyhei - (ele.y1 - ele.y0);
                if (dy < 0) dy = 0;
                ele.x1 += dx;
                // ele.y1 += dy;
                for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
                    const sub_ele = this.grandFlatArr[i];
                    sub_ele.x0 += dx
                    sub_ele.x1 += dx;
                    // sub_ele.y0 += dy;
                    // sub_ele.y1 += dy;
                }
                return;
            }

            if (r > 0) {

                let miny0 = Number.MAX_SAFE_INTEGER;

                let minx0 = Number.MAX_SAFE_INTEGER;
                for (let j = 0; j <= ele.cols; j++) {

                    let aboveEntry: [] = entriesEle[r - 1][j];
                    if (aboveEntry == null) continue;
                    for (let i = 0; i < aboveEntry.length; i++) {
                        let sub_ele: MMFlatStruct = aboveEntry[i];


                        if (sub_ele.type == LBlockType.mtable) {
                            let changeminx0 = (j == c);
                            [minx0, miny0] = this.getMinx0Miny0(sub_ele, minx0, miny0, changeminx0);
                        }
                        else {
                            if (sub_ele.y0 < miny0) miny0 = sub_ele.y0;
                            if (j == c) {
                                if (sub_ele.x0 < minx0) minx0 = sub_ele.x0;
                            }
                        }


                    }
                }
                let dy = newyhei - (ele.y1 - ele.y0);
                // if (dy < 0) dy = 0;
                let newy0 = (miny0 - newyhei);
                ele.y0 = newy0;
                // ele.y1 = newy0 + newyhei;

                return;
                let newx0 = minx0;
                let dx = newx0 - ele.x0;

                for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
                    const sub_ele = this.grandFlatArr[i];
                    // if (sub_ele.x0 == null || sub_ele.x1 == null) continue;
                    // if (sub_ele.y0 == null || sub_ele.y1 == null) continue;
                    sub_ele.x0 += dx
                    sub_ele.x1 += dx;
                    // sub_ele.y0 += dy;
                    // sub_ele.y1 += dy;
                }
            }

            // let dx = newxwid - (ele.x1 - ele.x0);
            // if (dx < 0) dx = 0;
            // let dy = newyhei - (ele.y1 - ele.y0);

            // ele.x1 += dx;
            // ele.y0 = -newy0;


            // for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
            //     const ele = this.grandFlatArr[i];
            //     // if (ele.x0 == null || ele.x1 == null) continue;
            //     // if (ele.y0 == null || ele.y1 == null) continue;
            //     ele.x0 += dx
            //     ele.x1 += dx;
            //     // ele.y0 += dy;
            //     // ele.y1 += dy;
            // }
        }

        // rearrangeYForTable() {
        //     while (this.tableStacksofStackY.length > 0) {
        //         let tablestack = this.tableStacksofStackY.pop();
        //         // webpack console.log("new tablestack:");
        //         while (tablestack.length > 0) {
        //             let oneTable = tablestack.pop();
        //             let entriesSize = [];
        //             let entriesEle = [];
        //             for (let i = 0; i < oneTable.row; i++) {
        //                 entriesSize.push([]);
        //                 entriesEle.push([]);
        //                 for (let j = 0; j < oneTable.col; j++) {
        //                     entriesSize[entriesSize.length - 1].push([-1, -1]);
        //                     let entries = lodash.filter(this.grandFlatArr, function (o) {
        //                         return (o.belongToTable != null
        //                             && o.colIdx == j && o.rowIdx == i && o.text != null && o.belongToTable.uuid === oneTable.uuid);
        //                     });
        //                     let parentTable = lodash.find(this.grandFlatArr, function (o) {
        //                         return (o.belongToTable != null && o.type == LBlockType.mtable
        //                             && o.colIdx == j && o.rowIdx == i && o.belongToTable.uuid === oneTable.uuid);
        //                     });
        //                     if (parentTable != null) entries.push(parentTable);

        //                     entriesEle[entriesEle.length - 1].push(entries);
        //                 }
        //             }

        //             // get proper size for each entry (maybe useless)
        //             for (let i = 0; i < oneTable.row; i++) {
        //                 for (let j = 0; j < oneTable.col; j++) {
        //                     let entries = lodash.filter(this.grandFlatArr, function (o) {
        //                         return (o.belongToTable != null)
        //                             && o.colIdx == j && o.rowIdx == i && o.text != null && o.belongToTable.uuid === oneTable.uuid;
        //                     });

        //                     entries.forEach(element => {
        //                         let dx = element.x1 - element.x0;
        //                         let dy = element.y1 - element.y0;
        //                         let curdx = entriesSize[i][j][0];
        //                         let curdy = entriesSize[i][j][1];
        //                         if (dx > curdx) curdx = dx;
        //                         if (dy > curdy) curdy = dy;
        //                         entriesSize[i][j] = [curdx, curdy];
        //                         // // webpack console.log(i,j,entriesSize[i][j] );
        //                     })
        //                 }
        //             }
        //             let entries = lodash.filter(this.grandFlatArr, function (o) { return (o.belongToTable != null) && o.text != null && o.belongToTable.uuid === oneTable.uuid; });
        //             entries.forEach(element => {

        //                 let index = lodash.findIndex(this.grandFlatArr, function (o) { return o.uuid == element.uuid });
        //                 let c = element.colIdx;
        //                 let r = element.rowIdx;

        //                 if (c >= 0 && r >= 0) {
        //                     let newxwid = entriesSize[r][c][0];
        //                     let newyhei = entriesSize[r][c][1];
        //                     const ele = this.grandFlatArr[index];
        //                     // webpack console.log(element.rowIdx, element.colIdx, element.text, r, c, entriesSize[r][c], newxwid - (ele.x1 - ele.x0));
        //                     this.moveDYfromidx(r, c, newxwid, newyhei, index, entriesEle);
        //                 }





        //             });

        //         }
        //     }




        // }

        moveDXfromidx(r: number, c: number, newxwid: number, newyhei: number, idx: number, entriesEle: any[]) {
            const ele = this.grandFlatArr[idx];
            if (r > 0) {

                let miny0 = Number.MAX_SAFE_INTEGER;

                let minx0 = Number.MAX_SAFE_INTEGER;
                let firstEntr: [] = entriesEle[0][c];
                for (let j = 0; j < firstEntr.length; j++) {
                    let sub_ele: MMFlatStruct = firstEntr[j];

                    if (sub_ele.type == LBlockType.mtable) {
                        let changeminx0 = true;
                        [minx0, miny0] = this.getMinx0Miny0(sub_ele, minx0, miny0, changeminx0);
                    }
                    else {
                        if (sub_ele.x0 < minx0) minx0 = sub_ele.x0;
                    }
                }

                let dx = ele.x0 - (newxwid / 2 + minx0)

                ele.x0 -= dx;
                ele.x1 = ele.x0 + newxwid;
                // webpack console.log(newxwid);

                // let dx = ele.x0-minx0;
                // ele.x0 = minx0  ;
                // ele.x1 = minx0+newxwid;

                for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
                    const sub_ele = this.grandFlatArr[i];
                    sub_ele.x0 -= dx
                    sub_ele.x1 -= dx;
                }







            }

            // let dx = newxwid - (ele.x1 - ele.x0);
            // if (dx < 0) dx = 0;
            // let dy = newyhei - (ele.y1 - ele.y0);

            // ele.x1 += dx;
            // ele.y0 = -newy0;


            // for (let i = idx + 1; i < this.grandFlatArr.length; i++) {
            //     const ele = this.grandFlatArr[i];
            //     // if (ele.x0 == null || ele.x1 == null) continue;
            //     // if (ele.y0 == null || ele.y1 == null) continue;
            //     ele.x0 += dx
            //     ele.x1 += dx;
            //     // ele.y0 += dy;
            //     // ele.y1 += dy;
            // }
        }
        // rearrangeXForTable() {
        //     while (this.tableStacksofStackX.length > 0) {
        //         let tablestack = this.tableStacksofStackX.pop();
        //         // webpack console.log("new tablestack:");
        //         while (tablestack.length > 0) {
        //             let oneTable = tablestack.pop();
        //             let entriesSize = [];
        //             let entriesEle = [];
        //             for (let i = 0; i < oneTable.row; i++) {
        //                 entriesSize.push([]);
        //                 entriesEle.push([]);
        //                 for (let j = 0; j < oneTable.col; j++) {
        //                     entriesSize[entriesSize.length - 1].push([-1, -1]);
        //                     let entries = lodash.filter(this.grandFlatArr, function (o) {
        //                         return (o.belongToTable != null && o.brakectForTab == null && o.text != " "
        //                             && o.colIdx == j && o.rowIdx == i && o.text != null && o.belongToTable.uuid === oneTable.uuid);
        //                     });
        //                     let parentTable = lodash.find(this.grandFlatArr, function (o) {
        //                         return (o.belongToTable != null && o.type == LBlockType.mtable
        //                             && o.colIdx == j && o.rowIdx == i && o.belongToTable.uuid === oneTable.uuid);
        //                     });
        //                     if (parentTable != null) entries.push(parentTable);

        //                     entriesEle[entriesEle.length - 1].push(entries);
        //                 }
        //             }

        //             // get proper size for each entry (maybe useless)
        //             for (let i = 0; i < oneTable.row; i++) {
        //                 for (let j = 0; j < oneTable.col; j++) {
        //                     let entries = lodash.filter(this.grandFlatArr, function (o) {
        //                         return (o.belongToTable != null)
        //                             && o.colIdx == j && o.rowIdx == i && o.text != null && o.belongToTable.uuid === oneTable.uuid;
        //                     });

        //                     entries.forEach(element => {
        //                         let dx = element.x1 - element.x0;
        //                         let dy = element.y1 - element.y0;
        //                         let curdx = entriesSize[i][j][0];
        //                         let curdy = entriesSize[i][j][1];
        //                         if (dx > curdx) curdx = dx;
        //                         if (dy > curdy) curdy = dy;
        //                         entriesSize[i][j] = [curdx, curdy];
        //                         // // webpack console.log(i,j,entriesSize[i][j] );
        //                     })
        //                 }
        //             }
        //             let entries = lodash.filter(this.grandFlatArr, function (o) { return (o.belongToTable != null) && o.text != null && o.belongToTable.uuid === oneTable.uuid; });
        //             entries.forEach(element => {

        //                 let index = lodash.findIndex(this.grandFlatArr, function (o) { return o.uuid == element.uuid });
        //                 let c = element.colIdx;
        //                 let r = element.rowIdx;

        //                 if (c >= 0 && r >= 0) {
        //                     let newxwid = entriesSize[r][c][0];
        //                     let newyhei = entriesSize[r][c][1];
        //                     const ele = this.grandFlatArr[index];
        //                     // webpack console.log(element.rowIdx, element.colIdx, element.text, r, c, entriesSize[r][c], newxwid - (ele.x1 - ele.x0));
        //                     this.moveDXfromidx(r, c, newxwid, newyhei, index, entriesEle);
        //                 }





        //             });

        //         }
        //     }




        // }
        putBlockStartEndToGrandFlatArr(block: LBlock) {

            var blockInArray = this.grandFlatArr[block.idxInArray];//lodash.find(this.grandFlatArr, function (o) { return o.uuid == block.uuid; });
            // var blockInArrayWithClose =lodash.find(this.grandFlatArrWithClose, function (o) { return o.uuid == block.uuid; });
            if (blockInArray != undefined) {
                if (block.maxx1 != null) blockInArray.maxx1 = block.maxx1;
                if (block.maxy1 != null) blockInArray.maxy1 = block.maxy1;
                if (block.minx0 != null) blockInArray.minx0 = block.minx0;
                if (block.miny0 != null) blockInArray.miny0 = block.miny0;
                if (block.y0 != null) blockInArray.y0 = block.y0;
                if (block.y1 != null) blockInArray.y1 = block.y1;
                if (block.x0 != null) blockInArray.x0 = block.x0;
                if (block.x1 != null) blockInArray.x1 = block.x1;
                if (block.scale != null) blockInArray.scale = block.scale;


                blockInArray.blockxy = {
                    x0: block.x0, x1: block.x1, y0: block.y0, y1: block.y1, scale: block.scale,
                    minx0: block.minx0, miny0: block.miny0, maxx1: block.maxx1, maxy1: block.maxy1
                };
                // // webpack console.log(blockInArray.type, blockInArray.blockxy);
            }



            if (block.children != null && block.children.length > 0) {
                block.children.forEach((child, idx) => {
                    this.putBlockStartEndToGrandFlatArr(child);
                });
            }

        }





        // using grandblocktree, assemble lvlstack which contains dimension for chars
        assembleLvlStack(initblock: LBlock) {
            // webpack console.log("start assembleLvlStack:")

            let localLvlStack: LBlock[] = [];
            let stack = [initblock];
            while (stack.length > 0) {
                let block = stack.shift();// pop the first ele from stack
                localLvlStack.push(block);
                if (block.children != null && block.children.length > 0) {
                    block.children.forEach((child, idx) => {
                        stack.push(child);
                    });
                }
            }

            lodash.reverse(localLvlStack);// now array goes from leaves back to head

            // making edim for each block from leaves
            localLvlStack.forEach(block => {
                // // webpack console.log("make edim for", block.type);
                block.edim = new ED.EDim(this.grandFlatArr, block);
            });
            // webpack console.log("=============");
            lodash.reverse(localLvlStack);// now array goes from head to leaves again


            // localLvlStack.forEach(block => {
            //     // webpack console.log(block.type + " " + block.lvl.toString() + " " + block.parent.type);
            //     // webpack console.log(block.edim.dim.scale);
            //     if (block.text != null)
            //     {
            //         // webpack console.log(block.text);
            //         // webpack console.log(block.edim.dim.xs)
            //         // webpack console.log(block.edim.dim.ys)
            //         // webpack console.log("-----");
            //     }
            // });

            this.lvlStack = localLvlStack;

            // webpack console.log("end asembleLvlStack:")

        }




        mfracAdjustment()
        {

            let tableBlock: LBlock;
            for (let i = 0; i < this.grandFlatArr.length; i++) {
                let ele = this.grandFlatArr[i];
                if (ele.type == LBlockType.mfrac) {
                    let lvlidx = 0;
                    let block = ele.refLblock;
                    for (let k = 0; k < this.lvlStack.length; k++) {
                        if (this.lvlStack[k].uuid === block.uuid) {
                            lvlidx = k;
                            break;
                        }
                    }
                    // for(let j=this.lvlStack[lvlidx].idxInArray;j<this.grandFlatArr.length;j++)
                    // {
                    //     // // webpack console.log("moving ",this.grandFlatArr[j].text);
                    //     this.grandFlatArr[j].refLblock.edim.spatialTransSingleEle({delx:0.8,dely:0},1);
                    // }




                    block.children[0].edim.dim.xs[0] = this.lvlStack[lvlidx - 1].edim.dim.xs[0];//+0.2; //block.children[0] is the mfracmid
                    block.children[0].edim.dim.xs[1] = this.lvlStack[lvlidx + 1].edim.dim.xs[1];//-0.2; //block.children[0] is the mfracmid

                    let numeratorWidth = block.children[1].edim.dim.xs[1] - block.children[1].edim.dim.xs[0];
                    let denomiatorWidth = block.children[2].edim.dim.xs[1] - block.children[2].edim.dim.xs[0];
                    let fracmidWidth = block.children[0].edim.dim.xs[1] - block.children[0].edim.dim.xs[0];

                    let numeratorCenterPoint = (numeratorWidth / 2 + block.children[1].edim.dim.xs[0]);
                    let denomiatorCenterPoint = (denomiatorWidth / 2 + block.children[2].edim.dim.xs[0]);
                    let fracmidCenterPoint = (fracmidWidth / 2 + block.children[0].edim.dim.xs[0]);

                    block.children[1].edim.spatialTrans({ delx: Math.round(fracmidCenterPoint - numeratorCenterPoint), dely: 0 }, 1);
                    block.children[2].edim.spatialTrans({ delx: Math.round(fracmidCenterPoint - denomiatorCenterPoint), dely: 0 }, 1);
                    // block.children[0].edim.dim.xs[1]+=1; 
                    //block.children[0] is the mfracmid

                    // for(let j=this.lvlStack[lvlidx+1].idxInArray;j<this.grandFlatArr.length;j++)
                    // {
                    //     // // webpack console.log("moving ",this.grandFlatArr[j].text);
                    //     this.grandFlatArr[j].refLblock.edim.spatialTransSingleEle({delx:1,dely:0},1);
                    // }

                    // fix bbox for parents
                    // let parent_to_root = block.parent;
                    // let lvltrs = block.lvl;
                    // while(parent_to_root!=null && lvltrs>0)
                    // {
                    //     let delx=1+0.8;
                    //     parent_to_root.edim.dim.xs[1]+=delx;
                    //     parent_to_root=parent_to_root.parent;
                    //     lvltrs-=1;
                    // }


                    //fix bbox for block

                }
            }

        }



        //taking care of fence [], {},()
        fenceAdjustment()
        {
            let tableBlock: LBlock;
            for (let i = 0; i < this.grandFlatArr.length; i++) {
                let ele = this.grandFlatArr[i];
                if (ele.attriArr != null) {
                    ele.attriArr.forEach(attrEle => {
                        if (attrEle.name === 'fence') {
                            let childIdx = 0; // the idx for this fence's parent's children list
                            let block = ele.refLblock;
                            for (let k = 0; k < block.parent.children.length; k++) {
                                if (block.parent.children[k].uuid === block.uuid) {
                                    childIdx = k;
                                    break;
                                }
                            }
                            let delx = 0;
                            let startingAdjustidxForGrandFlatArr = 0;
                            if (ele.text === "[" || ele.text === "(" || ele.text === "{" || ele.text === "|") {
                                tableBlock = block.parent.children[childIdx + 1];  //find the corresponding table block
                                delx = block.edim.adjustForFence(true, tableBlock); // dis adjust the table itself already
                                startingAdjustidxForGrandFlatArr = tableBlock.idxInArray + 1; //start adjusting starting from closing symbol

                                //fix bbox for parents
                                let parent_to_root = block.parent;
                                let lvltrs = block.lvl;
                                while (parent_to_root != null && lvltrs > 0) {
                                    parent_to_root.edim.dim.xs[1] += delx;
                                    parent_to_root = parent_to_root.parent;
                                    lvltrs -= 1;
                                }
                            }
                            else // ],),}
                            {
                                //dont need to set tableblock because [,{,( already set tableblock for u
                                delx = block.edim.adjustForFence(false, tableBlock); // dis leave the table untouched
                                startingAdjustidxForGrandFlatArr = block.idxInArray + 1; // start adjusting start from the the next thing after closing symbol

                                //fix bbox for parents
                                let parent_to_root = block.parent;
                                let lvltrs = block.lvl;
                                while (parent_to_root != null && lvltrs > 0) {
                                    parent_to_root.edim.dim.xs[1] += delx;
                                    parent_to_root = parent_to_root.parent;
                                    lvltrs -= 1;
                                }

                            }
                            for (let j = startingAdjustidxForGrandFlatArr; j < this.grandFlatArr.length; j++) {
                                // // webpack console.log("moving ",this.grandFlatArr[j].text);
                                this.grandFlatArr[j].refLblock.edim.spatialTransSingleEle({ delx: delx, dely: 0 }, 1);




                            }



                        }
                    });
                }
                // // webpack console.log(this.grandFlatArr[i].lvl, this.grandFlatArr[i].type,this.grandFlatArr[i].text);
            }




        }
        generateBoundingBoxAtText(): { positions: number[], indices: number[], vertices: Float32Array }
        {
            // let leafLvl = 0;
            // for (let i = 0; i < this.lvlStack.length; i++) {
            //     if(leafLvl<this.lvlStack[i].lvl)leafLvl=this.lvlStack[i].lvl;
            // }
            // lvlnum = leafLvl;
            let finalVertexArr = [];

            let xoffset = 0;
            let xscale = 0.6; // i manaully try and get width=0.6 to be the size of a char that has heigh = 1
            for (let i = 0; i < this.lvlStack.length; i++) {
                const ele = this.lvlStack[i];

                if (ele.text != null) {
                    let eledim = ele.edim.dim;
                    let box = { x0: xscale * (eledim.xs[0] + xoffset), x1: xscale * (eledim.xs[1] + xoffset), y0: eledim.ys[0], y1: eledim.ys[1] };
                    let mathtxts = new MathMlStringMesh("bbox", box, eledim.scale, TypeMesh.TMbbox);
                    let vertexArr = mathtxts.toTransedMesh();

                    for (let j = 0; j < vertexArr.length; j++) {
                        finalVertexArr.push(vertexArr[j]);
                    }
                }

            }

            return this.prepareFinalVertices(finalVertexArr);

        }
        generateBoundingBoxAtLevel(lvlnum: number): { positions: number[], indices: number[], vertices: Float32Array }
        {
            // let leafLvl = 0;
            // for (let i = 0; i < this.lvlStack.length; i++) {
            //     if(leafLvl<this.lvlStack[i].lvl)leafLvl=this.lvlStack[i].lvl;
            // }
            // lvlnum = leafLvl;
            let finalVertexArr = [];

            let xoffset = 0;
            let xscale = 0.6; // i manaully try and get width=0.6 to be the size of a char that has heigh = 1
            for (let i = 0; i < this.lvlStack.length; i++) {
                const ele = this.lvlStack[i];

                if (ele.lvl == lvlnum) {
                    let eledim = ele.edim.dim;
                    let box = { x0: xscale * (eledim.xs[0] + xoffset), x1: xscale * (eledim.xs[1] + xoffset), y0: eledim.ys[0], y1: eledim.ys[1] };
                    let mathtxts = new MathMlStringMesh("bbox", box, eledim.scale, TypeMesh.TMbbox);
                    let vertexArr = mathtxts.toTransedMesh();

                    for (let j = 0; j < vertexArr.length; j++) {
                        finalVertexArr.push(vertexArr[j]);
                    }
                }

            }

            return this.prepareFinalVertices(finalVertexArr);

        }

        prepareFinalVertices(finalVertexArr: any[]): { positions: number[], indices: number[], vertices: Float32Array }
        {
            let finalVertices: { positions: number[], indices: number[], vertices: Float32Array } = { positions: [], indices: [], vertices: new Float32Array() };
            let aggreIndex = 0;

            for (let i = 0; i < finalVertexArr.length; i++) {
                const vert = finalVertexArr[i];
                const vertIndixes = finalVertexArr[i].indices;
                const vertPositions = finalVertexArr[i].positions;
                for (let j = 0; j < vertIndixes.length; j++) {
                    finalVertices.indices.push(vertIndixes[j] + aggreIndex);
                }
                for (let j = 0; j < vertPositions.length; j++) {
                    finalVertices.positions.push(vertPositions[j]);
                }
                aggreIndex = aggreIndex + lodash.max(vertIndixes) + 1;




            }
            let poses = finalVertices["positions"];
            let minx = lodash.max(poses);
            let miny = minx;
            let minz = minx;
            for (let i = 0; i < poses.length; i++) {
                if (i % 3 == 0) {
                    if (poses[i] < minx) minx = poses[i];
                }
                if (i % 3 == 1) {
                    if (poses[i] < miny) miny = poses[i];
                }
                if (i % 3 == 2) {
                    if (poses[i] < minz) minz = poses[i];
                }
            }

            for (let i = 0; i < poses.length; i++) {
                if (i % 3 == 0) {
                    poses[i] -= minx;
                }
                if (i % 3 == 1) {
                    poses[i] -= miny;
                }
                if (i % 3 == 2) {
                    poses[i] -= minz;
                }
            }


            const verticesThreeJSBufferGeo = new Float32Array(finalVertices.indices.map(ele => {
                let indStart = 3 * ele;
                return [finalVertices.positions[indStart], finalVertices.positions[indStart + 1], finalVertices.positions[indStart + 2]];
            }).flat());

            finalVertices.vertices = verticesThreeJSBufferGeo;
            return finalVertices;

        }

        generateMathmesh(): { positions: number[], indices: number[], vertices: Float32Array } {
            let xoffset = 0;//-33;
            let xscale = 0.6; // i manaully try and get width=0.6 to be the size of a char that has heigh = 1
            let finalVertexArr = [];


            for (let i = 0; i < this.lvlStack.length; i++) {
                const ele = this.lvlStack[i];

                if (ele.text != null) {

                    if (ele.type == LBlockType.mfracmid) {
                        let eledim = ele.edim.dim;
                        const onechar = ele.text.toString();
                        let box = { x0: xscale * (eledim.xs[0] + xoffset), x1: xscale * (eledim.xs[1] + xoffset), y0: eledim.ys[0], y1: -1 };
                        // webpack console.log("putint mfracmid")
                        // webpack console.log(box);
                        let mathtxtMesh = new MathMlStringMesh("mfracmid", box, eledim.scale, TypeMesh.TMmfrac);

                        if (mathtxtMesh.hasMesh) {
                            let vertexArr = mathtxtMesh.toTransedMesh();
                            for (let j = 0; j < vertexArr.length; j++) {
                                finalVertexArr.push(vertexArr[j]);
                            }
                        }

                    }
                    else {

                        let eledim = ele.edim.dim;
                        let xinterval = (eledim.xs[1] - eledim.xs[0]) / ele.text.toString().length;
                        for (let j = 0; j < ele.text.toString().length; j++) {
                            const onechar = ele.text.toString()[j];

                            let box = { x0: xscale * (eledim.xs[0] + j * xinterval + xoffset), x1: -1, y0: eledim.ys[0], y1: -1 };
                            let mathtxtMesh = new MathMlStringMesh(onechar, box, eledim.scale, TypeMesh.TMChar);
                            if (mathtxtMesh.hasMesh) {
                                let vertexArr = mathtxtMesh.toTransedMesh();

                                for (let k = 0; k < vertexArr.length; k++) {
                                    finalVertexArr.push(vertexArr[k]);
                                }
                            }


                        }
                    }


                    // let mathtxts = new MathText.MathString(text, scene, layerMask);
                }


            }

            return this.prepareFinalVertices(finalVertexArr);
        }

        iterateGrandBlockTree(block: LBlock, pad: string) {
            // webpack console.log(block.idxInArray);
            if (block.children != null && block.children.length > 0) {

                block.children.forEach((child, idx) => {

                    if (child.type == LBlockType.mtable)
                        // webpack console.log(child.type.toString() + pad + " " + block.belongArr + " " + child.lvl + " yrange:[" + child.miny0.toFixed(3) + "," + child.maxy1.toFixed(3)
                        // webpack + " xrange:[" + child.minx0.toFixed(3) + "," + child.maxx1.toFixed(3) + "]");

                        this.iterateGrandBlockTree(child, pad + " ");
                });
                // webpack console.log("children depleted lvl:" + block.lvl);
            }
            else if (block.text != null) {

                // webpack console.log(block.idxInArray + " " + block.type.toString() + pad + " " + block.lvl + " " + "text:" + block.text + " scale:" + block.scale.toFixed(3) + " x:[" + block.x0.toFixed(3) + "," + block.x1.toFixed(3) + "]" + " y:[" + block.y0.toFixed(3) + "," + block.y1 + "]");
                // // webpack console.log(block.belongArr);
            }
            else {
                throw ('som ting wong');
            }
        }
        // getBlockEnd(block: LBlock, bstart: number): number {
        //     let bend = 0;
        //     if (block.children != null && block.children.length > 0) {
        //         block.children.forEach((child) => {
        //             child.start = bstart;
        //             bend = this.getBlockEnd(child, child.start );
        //             bstart = bend;
        //         });
        //         block.end = bend;
        //         return bend;
        //     }
        //     else if (block.text != null) {
        //         // // webpack console.log(block);
        //         bend = bstart + block.text.toString().length;
        //         block.end = bend;
        //         return bend;
        //     }
        //     else {
        //         throw('som ting wong');
        //         return bstart;
        //     }
        // }
        // addBlockStartEndToGRandBlockTree() {

        //     this.grandLBlockTree.start = 0;
        //     this.getBlockEnd(this.grandLBlockTree, this.grandLBlockTree.start);

        // };
        getProperScale(type: LBlockType, idx: number): number {
            let shrinkScale = 0.75

            if (type === LBlockType.msub || type === LBlockType.msup ||
                type === LBlockType.mover || type === LBlockType.munder) {
                if (idx == 0) return 1;
                if (idx == 1) return shrinkScale;
            }

            if (type === LBlockType.msubsup || type === LBlockType.munderover) {
                if (idx == 0) return 1;
                if (idx == 1) return shrinkScale;
                if (idx == 2) return 1;
            }
            return 1;
        };

        getProperX0Y0(block: LBlock, bx0: number, by0: number, bscale: number, blockChildIdx: number): [number, number] {
            let x0 = bx0;
            let y0 = by0;
            let type = block.type;
            let idx = blockChildIdx;
            if (type === LBlockType.msup) {
                if (idx == 0) return [x0, y0];
                if (idx == 1) return [x0, y0 + 0.75 * block.children[0].scale];
                else throw ("msup wrong");
            }
            if (type === LBlockType.msub) {
                if (idx == 0) return [x0, y0];
                if (idx == 1) return [x0, y0 - 0.25 * block.children[0].scale];
                else throw ("msub wrong");
            }
            if (type === LBlockType.msubsup) {
                if (idx == 0) return [x0, y0];
                if (idx == 1) return [x0, y0 - 0.25 * block.children[0].scale];
                if (idx == 2) return [block.children[1].x0, y0 + 0.75 * block.children[0].scale];
                else throw ("msubsup wrong");
            }
            if (type === LBlockType.munderover) {
                if (idx == 0) return [x0, y0];
                if (idx == 1) return [block.children[0].x0, y0 - .75 * block.children[0].scale];
                if (idx == 2) return [block.children[0].x0, y0 + .9 * block.children[0].scale];
                else throw ("msubsup wrong");
            }
            if (type === LBlockType.mover) {
                if (idx == 0) return [x0, y0];
                if (idx == 1) return [block.children[0].x0 + 0.25 * block.scale, y0 + .5 * block.children[0].scale];
                else throw ("msubsup wrong");
            }
            if (type === LBlockType.munder) {
                if (idx == 0) return [x0, y0];
                if (idx == 1) return [block.children[0].x0, y0 - .75 * block.children[0].scale];
                else throw ("msubsup wrong");
            }


            if (type === LBlockType.mfrac) {
                if (idx == 0) return [x0, y0 + 0.5 * block.scale];
                if (idx == 1) return [block.children[0].x0, y0 - 0.5 * block.scale];
            }
            return [x0, y0];
        }


        // getBlockEndForMTable(block: LBlock, bx0: number, by0: number, bscale: number,
        //     miny0: number, maxy1: number, minx0: number, maxx1: number): [number, number] {

        //     let bx1 = 0;
        //     let by1 = 0;
        //     let properBx0 = bx0;
        //     let properBy0 = by0;
        //     if (block.children != null && block.children.length > 0) {
        //         block.children.forEach((child, idx) => {
        //             bscale = bscale * this.getProperScale(block.type, idx);
        //             [properBx0, properBy0] = this.getProperX0Y0(block, bx0, by0, bscale, idx);
        //             child.x0 = properBx0;
        //             child.y0 = properBy0;
        //             child.scale = bscale;

        //             child.miny0 = properBy0;
        //             child.maxy1 = properBy0 + bscale;

        //             [bx1, by1] = this.getBlockEnd(child, child.x0, child.y0, child.scale,
        //                 miny0, maxy1, minx0, maxx1);

        //             if (child.miny0 < miny0) miny0 = child.miny0;
        //             if (child.maxy1 > maxy1) maxy1 = child.maxy1;
        //             if (child.minx0 < minx0) minx0 = child.minx0;
        //             if (child.maxx1 > maxx1) maxx1 = child.maxx1;

        //             bx0 = bx1;
        //             bx0 = maxx1;
        //             // if(bx0<bx1) bx0 = bx1;

        //         });
        //         block.x1 = bx1;
        //         block.y1 = by1;

        //         block.miny0 = miny0;
        //         block.maxy1 = maxy1;

        //         block.minx0 = minx0;
        //         block.maxx1 = maxx1;
        //         return [bx1, by1];
        //     }
        //     else if (block.text != null) {
        //         // // webpack console.log(block);
        //         let spacing = 0;
        //         // if(block.parent)
        //         bx1 = bx0 + block.scale * (spacing + block.text.toString().length);
        //         by1 = by0 + block.scale * 1;
        //         block.x1 = bx1;
        //         block.y1 = by1;
        //         if (by0 < miny0) block.miny0 = by0;
        //         if (by1 > maxy1) block.maxy1 = by1;
        //         if (bx0 < minx0) block.minx0 = bx0;
        //         if (bx1 > maxx1) block.maxx1 = bx1;
        //         return [bx1, by1];
        //     }
        //     else {
        //         throw ('som ting wong');
        //     }

        //     // return [0,0];
        // }

        getBlockWithUUID(block: LBlock, uuid: string): LBlock {
            if (block.uuid === uuid) {
                // // webpack console.log("found uuid");
                // // webpack console.log(block);
                return block;
            }
            let res = null;
            if (block.children != null && block.children.length > 0) {
                for (let i = 0; res == null && i < block.children.length; i++) {
                    res = this.getBlockWithUUID(block.children[i], uuid);
                }
            }
            return res;
        }


        putSmallBoxInBigBox(xp0: number, xp1: number, x0: number, x1: number) {
            let newx0 = xp0 + (xp1 - xp0) / 2 - (x1 - x0) / 2;
            return newx0;

        }


        getColIdx(curTotalMTDcnt: number, numCol: number) {
            let colIdx = curTotalMTDcnt % numCol;
            return colIdx;
        }



        fillinBelongArr() {

            function putinOrPulloutFromOwnedDetailsinfo(matchedType: LBlockType, ele: MMFlatStruct, ownedDetailsinfo: OwnedDetail[]) {
                if (ele.type == matchedType && ele.closeFor == null) {
                    if (matchedType == LBlockType.mtable) {
                        let edimcoords = []
                        for (let r = 0; r < ele.rows; r++) {
                            edimcoords.push([]);
                            for (let c = 0; c < ele.cols; c++) {
                                edimcoords[edimcoords.length - 1].push(new ED.EDim());
                            }
                        }
                        ele.tabEdimCoords = edimcoords;
                        ownedDetailsinfo.push({ owner: ele, tabDetail: { rowIdx: -1, colIdx: -1, tab: ele } });
                    }
                    else {
                        ownedDetailsinfo.push({ owner: ele, counter: -1 });
                    }
                }
                else if (ele.type == matchedType && ele.closeFor != null) {
                    lodash.remove(ownedDetailsinfo, function (tmp) { return tmp.owner.uuid === ele.closeFor.uuid });
                }
                return ownedDetailsinfo
            }


            let ownedDetailsinfo: OwnedDetail[] = [];


            for (let i = 0; i < this.grandFlatArrWithClose.length; i++) {
                const ele = this.grandFlatArrWithClose[i];


                if (ele.ownedDetails == undefined) {
                    ele.ownedDetails = [];
                }
                ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.mfrac, ele, ownedDetailsinfo);
                ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.msub, ele, ownedDetailsinfo);
                ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.msup, ele, ownedDetailsinfo);
                ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.msubsup, ele, ownedDetailsinfo);
                ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.mtable, ele, ownedDetailsinfo);
                ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.mover, ele, ownedDetailsinfo);
                ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.munder, ele, ownedDetailsinfo);
                ownedDetailsinfo = putinOrPulloutFromOwnedDetailsinfo(LBlockType.munderover, ele, ownedDetailsinfo);
                if (ele.closeFor != null) continue;

                for (let j = ownedDetailsinfo.length - 1; j >= 0; j--) {
                    let tmpDetail = ownedDetailsinfo[j];
                    if (ele.lvl - 1 == tmpDetail.owner.lvl) {
                        tmpDetail.counter = tmpDetail.counter + 1;
                        if (tmpDetail.owner.type == LBlockType.mfrac) {
                            switch (tmpDetail.counter) {
                                case 0:
                                    tmpDetail.pos = Position.Mid;//mfracmid
                                    break;
                                case 1:
                                    tmpDetail.pos = Position.Up;
                                    break;
                                case 2:
                                    tmpDetail.pos = Position.Down;
                            }
                        }
                        if (tmpDetail.owner.type == LBlockType.msub || tmpDetail.owner.type == LBlockType.munder) {
                            switch (tmpDetail.counter) {
                                case 0:
                                    tmpDetail.pos = Position.Mid;
                                    break;
                                case 1:
                                    tmpDetail.pos = Position.Down;
                            }
                        }
                        if (tmpDetail.owner.type == LBlockType.msup || tmpDetail.owner.type == LBlockType.mover) {
                            switch (tmpDetail.counter) {
                                case 0:
                                    tmpDetail.pos = Position.Mid;
                                    break;
                                case 1:
                                    tmpDetail.pos = Position.Up;
                            }
                        }
                        if (tmpDetail.owner.type == LBlockType.msubsup || tmpDetail.owner.type == LBlockType.munderover) {
                            switch (tmpDetail.counter) {
                                case 0:
                                    tmpDetail.pos = Position.Mid;
                                    break;
                                case 1:
                                    tmpDetail.pos = Position.Down;
                                    break;
                                case 2:
                                    tmpDetail.pos = Position.Up;
                            }
                        }

                    }

                }






                for (let j = ownedDetailsinfo.length - 1; j >= 0; j--) {
                    let ownedDetailinfo = ownedDetailsinfo[j];
                    if (ownedDetailinfo.owner.type == LBlockType.mtable) {
                        let mostRecentTabInfo = ownedDetailinfo.tabDetail;
                        if (ele.type == LBlockType.mtr && ele.closeFor == null) {
                            mostRecentTabInfo.rowIdx += 1;
                        }
                        if (ele.type == LBlockType.mtd && ele.closeFor == null) {
                            mostRecentTabInfo.colIdx += 1;
                        }
                        if (ele.closeFor != null) continue;
                        mostRecentTabInfo.colIdx = this.getColIdx(mostRecentTabInfo.colIdx, ownedDetailinfo.owner.cols);
                        break;
                    }
                }
                for (let j = 0; j <= ownedDetailsinfo.length - 1; j++) {
                    let ownedDetailinfo = ownedDetailsinfo[j];
                    if (ownedDetailinfo.owner.type == LBlockType.mtable) {
                        let tmptab = ownedDetailinfo.tabDetail;
                        ele.ownedDetails.push({ owner: ownedDetailinfo.owner, tabDetail: { colIdx: tmptab.colIdx, rowIdx: tmptab.rowIdx, tab: tmptab.tab } });
                    }
                    else {
                        ele.ownedDetails.push({ owner: ownedDetailinfo.owner, pos: ownedDetailinfo.pos, counter: ownedDetailinfo.counter });
                    }
                }







                //logging out 
                // if (ele.text!=null) {
                //     // webpack console.log(ele.text)
                //     // webpack console.log(ele.ownedDetails)
                //     for (let j = ele.ownedDetails.length - 1; j >= 0; j--) {
                //         // webpack console.log(ele.ownedDetails[j].pos)
                //     }
                // }


            }






        }

        // markTableInfoinArr() {
        //     this.tableStacksofStackX = [];
        //     this.tableStacksofStackY = [];
        //     let curOpenedTable = [];


        //     let tmpTableInfo = { rowIdx: 0, colIdx: 0, tab: this.grandFlatArrWithClose[0] };
        //     for (let i = 0; i < this.grandFlatArrWithClose.length; i += 1) {
        //         const ele = this.grandFlatArrWithClose[i];
        //         // const eleinArray = lodash.find(this.grandFlatArr, function (o) { return o.uuid == ele.uuid; });




        //         if (ele.type == LBlockType.mtable && ele.closeFor == null) {

        //             if (curOpenedTable.length == 0) {
        //                 this.tableStacksofStackX.push([ele]);
        //                 this.tableStacksofStackY.push([ele]);
        //             }
        //             else {
        //                 ele.belongToTable = tmpTableInfo.tab;// mark table in table
        //                 ele.rowIdx = tmpTableInfo.rowIdx;// mark table in table
        //                 ele.colIdx = this.getColIdx(tmpTableInfo.colIdx, tmpTableInfo.tab.col);// mark table in table
        //                 this.tableStacksofStackX[this.tableStacksofStackX.length - 1].push(ele);
        //                 this.tableStacksofStackY[this.tableStacksofStackY.length - 1].push(ele);
        //             }
        //             tmpTableInfo = { rowIdx: -1, colIdx: -1, tab: ele };
        //             curOpenedTable.push(tmpTableInfo);
        //             this.grandFlatArrWithClose[i - 2].belongToTable = ele; // marking "["
        //             this.grandFlatArrWithClose[i - 2].colIdx = 0; // marking "["
        //             this.grandFlatArrWithClose[i - 2].rowIdx = 0; // marking "["
        //             this.grandFlatArrWithClose[i - 2].brakectForTab = true;
        //             continue;

        //         }
        //         if (ele.type == LBlockType.mtable && ele.closeFor != null) {
        //             // this.grandFlatArrWithClose[i + 1].belongToTable = tmpTableInfo.tab; // marking "]"
        //             // this.grandFlatArrWithClose[i + 1].colIdx = tmpTableInfo.tab.col - 1; // marking "]"
        //             // this.grandFlatArrWithClose[i + 1].rowIdx = tmpTableInfo.tab.row - 1; // marking "]"
        //             // this.grandFlatArrWithClose[i + 1].brakectForTab=true;

        //             curOpenedTable.pop();
        //             tmpTableInfo = curOpenedTable[curOpenedTable.length - 1];
        //             i = i + 1
        //             continue;
        //         }
        //         if (curOpenedTable.length == 0 || ele.closeFor != null) continue;


        //         ele.belongToTable = tmpTableInfo.tab;
        //         ele.col = ele.belongToTable.col;
        //         ele.row = ele.belongToTable.row;

        //         // if(ele.type==="mtr" || ele.type==="mtd" ){
        //         //     ele.belongToTable = tmpTableInfo.tab;
        //         //     ele.col=ele.belongToTable.col;
        //         //     ele.row=ele.belongToTable.row;
        //         // }

        //         if (ele.type == LBlockType.mtr) {
        //             tmpTableInfo.rowIdx += 1;
        //             ele.rowIdx = tmpTableInfo.rowIdx;
        //         }
        //         else if (ele.type == LBlockType.mtd) {
        //             ele.rowIdx = tmpTableInfo.rowIdx;
        //             tmpTableInfo.colIdx += 1;
        //             ele.colIdx = this.getColIdx(tmpTableInfo.colIdx, tmpTableInfo.tab.col);
        //         }
        //         else {
        //             // ele.belongToTable = tmpTableInfo.tab;
        //             // ele.col=ele.belongToTable.col;
        //             // ele.row=ele.belongToTable.row;
        //             ele.rowIdx = tmpTableInfo.rowIdx;
        //             ele.colIdx = this.getColIdx(tmpTableInfo.colIdx, tmpTableInfo.tab.col);
        //         }
        //     }


        //     // put colIdx and rowIdx info into "mtd" and "mtr" in granblocktree
        //     // let blockTreeStack = [this.grandLBlockTree];
        //     // while (blockTreeStack.length > 0) {
        //     //     let block = blockTreeStack.pop();
        //     //     if (block.children != null) {
        //     //         block.children.forEach((child, idx) => {
        //     //             blockTreeStack.push(child);
        //     //         })
        //     //     }
        //     //     if (block.type == LBlockType.mtd) {
        //     //         let idx = block.idxInArray;
        //     //         block.colidx = this.grandFlatArr[idx].colIdx;
        //     //         block.rowidx = this.grandFlatArr[idx].rowIdx;
        //     //         block.belongToTable = this.grandFlatArr[idx].belongToTable;
        //     //         // const index = lodash.findIndex(this.grandFlatArr, (sub_ele) => sub_ele.uuid === block.belongToTable.uuid);
        //     //         block.col = block.belongToTable.col;
        //     //         block.row = block.belongToTable.row;
        //     //     }
        //     //     if (block.type == LBlockType.mtr) {
        //     //         let idx = block.idxInArray;
        //     //         block.rowidx = this.grandFlatArr[idx].rowIdx;
        //     //         block.belongToTable = this.grandFlatArr[idx].belongToTable;
        //     //         // const index = lodash.findIndex(this.grandFlatArr, (sub_ele) => sub_ele.uuid === block.belongToTable.uuid);
        //     //         block.row = block.belongToTable.row;
        //     //     }
        //     // }








        // };

        getBlockEnd(block: LBlock, bx0: number, by0: number, bscale: number,
            miny0: number, maxy1: number, minx0: number, maxx1: number): [number, number] {


            let bx1 = 0;
            let by1 = 0;
            let properBx0 = bx0;
            let properBy0 = by0;

            if (block.children != null && block.children.length > 0) {

                block.children.forEach((child, idx) => {

                    bscale = bscale * this.getProperScale(block.type, idx);
                    [properBx0, properBy0] = this.getProperX0Y0(block, bx0, by0, bscale, idx);
                    if (block.type == LBlockType.munderover && idx == 2) properBx0 += bscale;

                    child.x0 = properBx0;
                    child.y0 = properBy0;
                    child.scale = bscale;

                    child.miny0 = properBy0;
                    child.maxy1 = properBy0 + bscale;

                    child.minx0 = properBx0;
                    child.maxx1 = properBx0 + bscale;



                    [bx1, by1] = this.getBlockEnd(child, child.x0, child.y0, child.scale, miny0, maxy1, minx0, maxx1);
                    if (child.miny0 < miny0) miny0 = child.miny0;
                    if (child.maxy1 > maxy1) maxy1 = child.maxy1;
                    if (child.minx0 < minx0) minx0 = child.minx0;
                    if (child.maxx1 > maxx1) maxx1 = child.maxx1;

                    bx0 = bx1;

                    // by0=by1; //trying y
                });


                block.x1 = bx1;


                block.y1 = by1;

                block.miny0 = miny0;
                block.maxy1 = maxy1;
                block.minx0 = minx0;
                block.maxx1 = maxx1;

                if (block.type === LBlockType.msub || block.type === LBlockType.msup || block.type == LBlockType.msubsup ||
                    block.type === LBlockType.mover || block.type === LBlockType.munder || block.type === LBlockType.munderover) bx1 = maxx1;
                return [bx1, by1];
            }
            else if (block.text != null) {
                // // webpack console.log(block);
                let realBTextLen = block.text.toString().length;



                bx1 = bx0 + block.scale * realBTextLen;
                by1 = by0 + block.scale * 1;



                block.x1 = bx1;
                block.y1 = by1;

                if (by0 < miny0) block.miny0 = by0;
                if (by1 > maxy1) block.maxy1 = by1;
                if (bx0 < minx0) block.minx0 = bx0;
                if (bx1 > maxx1) block.maxx1 = bx1;
                return [bx1, by1];
            }
            else {
                throw ('som ting wong');
            }
        }


        addBlockStartEndToGRandBlockTree() {

            this.grandLBlockTree.x0 = 0;
            this.grandLBlockTree.y0 = 0;
            this.grandLBlockTree.miny0 = Number.MAX_SAFE_INTEGER;
            this.grandLBlockTree.minx0 = Number.MAX_SAFE_INTEGER;
            this.grandLBlockTree.maxy1 = Number.MIN_SAFE_INTEGER;
            this.grandLBlockTree.maxx1 = Number.MIN_SAFE_INTEGER;
            let miny0 = Number.MAX_SAFE_INTEGER;
            let minx0 = Number.MAX_SAFE_INTEGER;
            let maxy1 = Number.MIN_SAFE_INTEGER;
            let maxx1 = Number.MIN_SAFE_INTEGER;


            // this.grandLBlockTree.y0 = 0;
            this.getBlockEnd(this.grandLBlockTree, this.grandLBlockTree.x0, this.grandLBlockTree.y0, this.grandLBlockTree.scale, miny0, maxy1, minx0, maxx1);

        };


        addBlockYEndToGrandBlockTree(block: LBlock) {
            if (block.children != null && block.children.length > 0) {


            }
            else if (block.text != null) {
                // // webpack console.log(block);

            }
            else {
                throw ('som ting wong');
            }
        };

        addHeightToGrandLBlockTree() {

        };
        turnGrandFlatArrToGrandLBlockTree() {
            this.grandLBlockTree = { children: [], lvl: 0, scale: 1, type: LBlockType.mrow, uuid: this.grandFlatArr[0].uuid, idxInArray: 0, belongArr: [] };
            this.grandFlatArr[0].refLblock = this.grandLBlockTree;

            this.grandLBlockTree.parent = this.grandLBlockTree;
            let parentOfnewLBlockArr = [this.grandLBlockTree];

            for (let i = 1; i < this.grandFlatArr.length; i += 1) {
                const ele = this.grandFlatArr[i];

                if (ele.closeFor == null) {
                    let parentOfnewLBlock = parentOfnewLBlockArr[ele.lvl - 1];
                    let newLBlock: LBlock = { lvl: ele.lvl, parent: parentOfnewLBlock, scale: parentOfnewLBlock.scale, type: LBlockType[ele.type], uuid: ele.uuid, idxInArray: i, belongArr: [] };
                    this.grandFlatArr[i].refLblock = newLBlock;
                    switch (ele.type) {
                        case LBlockType.mo:
                            newLBlock["text"] = ele.text;
                            parentOfnewLBlock.children.push(newLBlock);
                            break;
                        case LBlockType.mi:
                            newLBlock["text"] = ele.text;
                            parentOfnewLBlock.children.push(newLBlock);
                            break;
                        case LBlockType.mn:
                            newLBlock["text"] = ele.text;
                            parentOfnewLBlock.children.push(newLBlock);
                            break;
                        case LBlockType.mtext:
                            newLBlock["text"] = ele.text;
                            parentOfnewLBlock.children.push(newLBlock);
                            break;
                        case LBlockType.mfracmid:
                            newLBlock["text"] = ele.text;
                            parentOfnewLBlock.children.push(newLBlock);
                            break;
                        case LBlockType.mtable:
                            newLBlock["col"] = ele.cols;
                            newLBlock["row"] = ele.rows;
                        default:
                            newLBlock["children"] = [];
                            if (ele.lvl == parentOfnewLBlockArr.length) parentOfnewLBlockArr.push(newLBlock);
                            else parentOfnewLBlockArr[ele.lvl] = newLBlock;
                            parentOfnewLBlock.children.push(newLBlock);
                            break;
                    }
                }
            }
        };


        addRowColAttriForTablesInFlatArrs() {
            let curTable: MMFlatStruct = { type: LBlockType.mdummy, lvl: -1, cols: 1, rows: 1 };

            let tableStack = [];


            for (let i = 0; i < this.grandFlatArrWithClose.length; i += 1) {
                const ele = this.grandFlatArrWithClose[i];
                if (ele.type == LBlockType.mtable && ele.closeFor == null) {
                    tableStack.push(ele);
                    curTable = ele;
                    curTable.cols = 0;
                    curTable.rows = 0;
                }
                if (ele.type == LBlockType.mtd && ele.closeFor == null) {
                    curTable.cols += 1;
                    // const index = lodash.findIndex(this.grandFlatArr, (sub_ele) => sub_ele.uuid === ele.uuid);
                    // let spaceBetweenCol: MMFlatStruct = { type: LBlockType.mi, lvl: ele.lvl + 1, text: " ", uuid: uuidv4().toString() };
                    // this.grandFlatArr.splice(index + 1, 0, spaceBetweenCol);


                    // this.grandFlatArrWithClose.splice(i + 1, 0, spaceBetweenCol);
                    // let spaceBetweenColClose: MMFlatStruct = { type: LBlockType.mi, lvl: ele.lvl + 1, closeFor: spaceBetweenCol };

                    // this.grandFlatArrWithClose.splice(i + 2, 0, spaceBetweenColClose);

                }
                if (ele.type == LBlockType.mtr && ele.closeFor == null) {
                    curTable.rows += 1;
                }
                if (ele.type == LBlockType.mtable && ele.closeFor != null) {
                    curTable.cols = (curTable.cols / curTable.rows | 0);
                    // webpack console.log("col:" + curTable.cols + " row:" + curTable.rows);

                    const index = lodash.findIndex(this.grandFlatArr, (sub_ele) => sub_ele.uuid === ele.closeFor.uuid);
                    this.grandFlatArr[index].cols = curTable.cols;
                    this.grandFlatArr[index].rows = curTable.rows;


                    tableStack.pop();
                    if (tableStack.length > 0) curTable = tableStack[tableStack.length - 1];
                }
            }

        }
        findLastOpenEleAtlvl(j: number): MMFlatStruct {

            for (let i = this.grandFlatArrWithClose.length - 1; i >= 0; i -= 1) {
                const ele = this.grandFlatArrWithClose[i];
                if (ele.lvl == j && ele.closeFor == null) {
                    return ele;
                }
            }

        }


        assembleGrandFlatWithCloseArr() {
            let lastNode: MMFlatStruct = { type: this.grandFlatArr[0].type, lvl: this.grandFlatArr[0].lvl, belongArr: [] };
            this.grandFlatArr.push(lastNode);
            let prevLvl = -1;
            for (let i = 0; i < this.grandFlatArr.length; i++) {
                const curEle = this.grandFlatArr[i];
                if (curEle.lvl <= prevLvl) {
                    let j = prevLvl;
                    while (j >= curEle.lvl) {
                        const lastOpenEleAtLvlj = this.findLastOpenEleAtlvl(j);
                        let eleThatClose: MMFlatStruct = { type: lastOpenEleAtLvlj.type, lvl: lastOpenEleAtLvlj.lvl, closeFor: lastOpenEleAtLvlj, belongArr: [] };
                        this.grandFlatArrWithClose.push(eleThatClose);
                        j -= 1;
                    }
                }
                this.grandFlatArrWithClose.push(curEle);
                prevLvl = curEle.lvl;
            };
            this.grandFlatArrWithClose.pop();
            this.grandFlatArr.pop();
        }

        assembleGrandFlatArr(curNode: MTag) {
            // var mmstruct: MMFlatStruct = { uuid: uuidv4().toString(), lvl: curNode.lvl, type: curNode.type, belongArr: [] };

            this.uuidcnt += 1;
            var mmstruct: MMFlatStruct = { uuid: this.uuidcnt.toString(), lvl: curNode.lvl, type: curNode.type, belongArr: [] };

            let str = "lvl:" + curNode.lvl + " name:" + curNode.type;

            if (curNode.type == LBlockType.mtext) {
                if (curNode.text != null)
                    curNode.text += '\u0020'; //u0020 is space
                else
                    curNode.text = '\u0020';
            }
            if (curNode.text != null) {
                str += " text:" + curNode.text;
                if (curNode.text.toString().charCodeAt(0).toString(16).padStart(4, "0") == "2061") curNode.text = '\u0020'; //  null char null space
                mmstruct.text = curNode.text;
            }

            if (curNode.attriArr != null) {
                str += " attri:[";
                curNode.attriArr.forEach(attri => {
                    str += "{" + attri.name + ":" + attri.val + "}"
                });
                str += "]";
                mmstruct.attriArr = curNode.attriArr;
            }

            // webpack console.log(str);
            this.grandFlatArr.push(mmstruct);

            curNode.children.forEach(element => {
                this.assembleGrandFlatArr(element);
            });

        }


        traverseToCurLvlFromFirstNode(targetLvl) {
            var curlvl = -1;
            let curNode: MTag = this.grandMTagNode;
            let intoNewLvl = false;
            while (curlvl < targetLvl) {
                curlvl += 1;
                if (curNode.children.length > 0) {
                    // curNode = curNode.children.at(-1);
                    curNode = curNode.children[curNode.children.length - 1];
                }
                else {
                    if (curlvl == targetLvl) {
                        intoNewLvl = true;
                    }
                }
            }
            return { lastNode: curNode, intoNewLvl: intoNewLvl };
        }

        assembleGrandMTagNode() {
            this.meleArr.forEach(ele => {
                let atLvlNode = this.traverseToCurLvlFromFirstNode(ele.lvl);
                let traversedNode = atLvlNode.lastNode;
                let nextMoveintoNewLvl = atLvlNode.intoNewLvl;
                switch (ele.type) {
                    case MEleType.Start:
                        var newMTag: MTag = { type: LBlockType[ele.node], lvl: ele.lvl, children: [] };
                        if (nextMoveintoNewLvl) {
                            // first child in this new level
                            newMTag.parent = traversedNode;
                            traversedNode.children.push(newMTag);
                        }
                        else {
                            newMTag.parent = traversedNode.parent;
                            traversedNode.parent.children.push(newMTag);
                        }
                        break;
                    case MEleType.Attris:
                        traversedNode.attriArr = ele.attriArr;
                        break;
                    case MEleType.Text:
                        traversedNode.text = ele.text;
                        break;
                }
            });
            this.grandMTagNode = this.grandMTagNode.children[0];







        }






        // recuArray(prenodeKey, curArr, level, cuStringArr) {

        //     for (var i = 0; i < curArr.length; i++) {
        //         this.assembleMEleArrByRecuOnObject(prenodeKey, curArr[i], level, cuStringArr);
        //     }

        // }

        assembleMEleArrByRecuOnObject(prenodeKey, curObj, level, cuStringArr) {



            if (Object.prototype.toString.call(curObj) === '[object Array]') {
                // recuArray(prenodeKey, curObj, level,cuStringArr);
                // return;
                for (var i = 0; i < curObj.length; i++) {
                    this.assembleMEleArrByRecuOnObject(prenodeKey, curObj[i], level, cuStringArr);
                }
            }



            let attriKey = ":@";
            let textKey = "#text";
            var keys = Object.keys(curObj);
            for (var j = 0; j < keys.length; j++) {
                let key = keys[j];
                if (key.includes("annotation")) return;
            }

            if (lodash.includes(keys, textKey)) {
                // // webpack console.log(prenodeKey + " " + textKey + " " + curObj[textKey] + " level:" + (level - 1).toString());
                //cuStringArr.push(prenodeKey + " " + textKey + " " + curObj[textKey] + " level:" + (level - 1).toString());
                var tmpMText: MEle = { node: prenodeKey, lvl: level - 1, text: curObj[textKey].toString(), type: MEleType.Text };
                this.meleArr.push(tmpMText);


            }




            for (var i = 0; i < keys.length; i++) {
                let key = keys[i];
                let val = curObj[key];
                if (Object.prototype.toString.call(val) === '[object Array]') {
                    // // webpack console.log("start " + key + " " + level.toString());
                    //cuStringArr.push("start " + key + " " + level.toString());
                    var tmpMEle: MEle = { node: key, lvl: level, type: MEleType.Start };
                    this.meleArr.push(tmpMEle);

                    if (lodash.includes(keys, attriKey)) {

                        var attriDets: MAttriDet[] = [];

                        for (var k = 0; k < Object.keys(curObj[attriKey]).length; k++) {

                            var subkey = Object.keys(curObj[attriKey])[k];
                            var subval = curObj[attriKey][subkey];
                            // // webpack console.log(key + " " + subkey + " " + subval + " level " + level.toString());
                            //cuStringArr.push(key + " " + subkey + " " + subval + " level " + level.toString());
                            attriDets.push({ name: subkey.substring(2), val: subval })
                        }

                        var tmpMAttris: MEle = { node: key, lvl: level, attriArr: attriDets, type: MEleType.Attris };
                        this.meleArr.push(tmpMAttris);

                    }
                    this.assembleMEleArrByRecuOnObject(key, val, level + 1, cuStringArr);

                }

            }

        }

    }



export * as MathmlParser from './mathmlParser';
