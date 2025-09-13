const sqlite3 = require("sqlite3").verbose();
const { resolve } = require("dns");
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "stzysk.db"));

// 2) 建表（只建一次即可）
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      qid        TEXT    NOT NULL,
      q          TEXT    NOT NULL,
      d          TEXT,
      k          TEXT,  
      type       TEXT,
      area       TEXT,
      f          TEXT,
      m          TEXT
    )
  `);
});
var stmt = db.prepare(`
    INSERT INTO questions (qid, q, d, k, type, area, f, m)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

async function got(page, o) {
    try {
        console.log(`{"onlyCheckUrlAndMethod":true,"pageNum":1,"pageSize":10,"params":{"studyPhaseCode":"300","subjectCode":"9","searchType":2,"sort":${o.sort},"yearCode":"${o.yearCode}","gradeCode":"","provinceCode":"${o.provinceCode}","cityCode":"","areaCode":"","organizationCode":"","termCode":"","paperType":"${o.paperType}","showQuestionTypeCode":"${o.showQuestionTypeCode}","questionParentCode":"${o.showQuestionTypeCode}","diffcultCode":"${o.diffcultCode}","questionFeatureCode":"${o.questionFeatureCode}","questionMethodCode":"${o.questionMethodCode}","capacityMethod":"${o.capacityMethod}","situationCode":"${o.situationCode}","keyWord":"","filterQuestionFlag":false,"searchScope":0,"treeIds":["${o.treeid}"]}}`);
        return await fetch(
            "https://qms.stzy.com/matrix/zw-search/api/v1/homeEs/question/keyPointQuery",
            {
                credentials: "omit",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
                    "Accept": "application/json, text/plain, */*",
                    "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
                    "Content-Type": "application/json",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
                    "Priority": "u=0"
                },
                referrer: "https://zj.stzy.com/",
                body:`{"onlyCheckUrlAndMethod":true,"pageNum":1,"pageSize":10,"params":{"studyPhaseCode":"300","subjectCode":"9","searchType":2,"sort":${o.sort},"yearCode":"${o.yearCode}","gradeCode":"","provinceCode":"${o.provinceCode}","cityCode":"","areaCode":"","organizationCode":"","termCode":"","paperType":"${o.paperType}","showQuestionTypeCode":"${o.showQuestionTypeCode}","questionParentCode":"${o.showQuestionTypeCode}","diffcultCode":"${o.diffcultCode}","questionFeatureCode":"${o.questionFeatureCode}","questionMethodCode":"${o.questionMethodCode}","capacityMethod":"${o.capacityMethod}","situationCode":"${o.situationCode}","keyWord":"","filterQuestionFlag":false,"searchScope":0,"treeIds":["${o.treeid}"]}}`,
                method: "POST",
                mode: "cors",
            },
        ).then((e) => e.json());
    } catch (err) {
        console.log(err);
    }
}
var all = [];
function fn(e) {
    stmt.run(
        e.questionId,
        e.questionArticle,
        e.diffcultCode,
        e.keyPointIds,
        e.showQuestionTypeCode ||0,
        e.provinceCode ||0,
        e.questionFeatureName || 0,
        e.questionMethodName || 0,
    );
}
var errb = [];
/*分类
忽略以及该项有无
yearCode["2025","2024","2023","2022","2021","2020","2019","2018","2017","-1",""]
questionFeatureCode["19","35","38","39","40","41","42","57","58",""]以及该项有无
questionMethodCode["29","69","70","72","73","74","75","100",""]以及该项有无
capacityMethod["34","35","36","37","38","39",""]以及该项有无
situationCode["53","60","54","55",""]以及该项有无



paperType["22","1","2","3","4","5","6","7","8","12","13","14","15","10","9","16","19",""]以及该项有无
provinceCode["-1","110000","120000","130000","140000","150000","210000","220000","230000","310000","320000","330000","340000","350000","360000","370000","410000","420000","430000","440000","450000","460000","500000","510000","520000","530000","540000","610000","620000","630000","640000","650000",""]以及该项有无
showQuestionTypeCode["1","2","39","187","4","5","295","188",""]以及该项有无
diffcultCode["1","2","3","4","5",""]以及该项有无
sort[0,1,2]
*/
var LyearCode=["2025","2024","2023","2022","2021","2020","2019","2018","2017","-1",""];
var LquestionFeatureCode=[["19","35","38","39","40"],["41","42","57","58",""]];
var LquestionMethodCode=["29","69","70","72","73","74","75","100",""];
var LcapacityMethod=["34","35","36","37","38","39",""];
var LsituationCode=["53","60","54","55",""];
var LpaperType=["22","1","2","3","4","5","6","7","8","12","13","14","15","10","9","16","19",""];
var LprovinceCode=["-1","110000","120000","130000","140000","150000","210000","220000","230000","310000","320000","330000","340000","350000","360000","370000","410000","420000","430000","440000","450000","460000","500000","510000","520000","530000","540000","610000","620000","630000","640000","650000",""]
var LshowQuestionTypeCode=["1","2","39","187","4","5","295","188",""];
var LdiffcultCode=["1","2","3","4","5",""];
var Lsort=[0,1,2]
async function getter(treeid) {
    try {
        var gl = [];
        for(var i0=0;i0<(LyearCode.length,1);i0++){
        for(var i1=0;i1<(LprovinceCode.length,1);i1++){
        for(var i2=0;i2<(LquestionMethodCode.length,1);i2++){
        for(var i3=0;i3<(LcapacityMethod.length,1);i3++){
        for(var i4=0;i4<(LsituationCode.length,1);i4++){
        for(var i5=0;i5<(LpaperType.length,1);i5++){
        for(var i6=0;i6<(Lsort.length,1);i6++){
        for(var i7=0;i7<(LshowQuestionTypeCode.length,1);i7++){
        for(var i8=0;i8<LdiffcultCode.length;i8++){
        for(var i9=0;i9<LquestionFeatureCode.length;i9++){
            LquestionFeatureCode[i9].forEach(FeatureCode=>{
                gl.push(
                    new Promise((resolve, reject) => {
                        process.stdout.write(`\r${i0+1}/11 ${i1+1}/33 ${i2+1}/9 ${i3+1}/7 ${i4+1}/5 ${i5+1}/18 ${i6+1}/3 ${i7+1}/9 ${i8+1}/6 ${i9+1}/2                         `);
                        got(1, 
                            {
                                sort:Lsort[i6],
                                yearCode:LyearCode[i0],
                                provinceCode:LprovinceCode[i1],
                                paperType:LpaperType[i5],
                                showQuestionTypeCode:LshowQuestionTypeCode[i7],
                                diffcultCode:LdiffcultCode[i8],
                                questionFeatureCode:FeatureCode,
                                questionMethodCode:LquestionMethodCode[i2],
                                capacityMethod:LcapacityMethod[i3],
                                situationCode:LsituationCode[i4],
                                treeid:treeid,
                            }
                        ).then((r) => {
                            if (r.code != 200) {
                                stmt.finalize();
                                db.close((err) => {
                                    if (err) console.error(err);
                                    else console.log("✅ 写入完成");
                                });
                                console.log(r);
                                errb.push([treeid,[i0,i1,i2,i3,i4,i5,i6,i7,i8,i9]]);
                            }
                            r.data.list.forEach((e) => {
                                fn(e);
                            });
                            resolve(1);
                        });
                    }),
                );
            })
            await Promise.all(gl);
            gl = [];
        }}}}}}}}}}
    } catch (err) {
        console.log(err);
        errb.push([treeid]);
    }
}
var b = ["18199"];

async function bian(arr) {
    for (var i = 0; i < arr.length; i++) {
        await getter(arr[i]);
        console.log(`\n[${i + 1}/${arr.length}]`);
        stmt.finalize();
        stmt = db.prepare(`
            INSERT INTO questions (qid, q, d, k, type, area, f, m)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
    }

    stmt.finalize();
    db.close((err) => {
        if (err) console.error(err);
        else console.log("✅ 写入完成");
    });
}
bian(b);
