const sqlite3 = require("sqlite3").verbose();
const { resolve } = require("dns");
const path = require("path");
const fs = require("fs");
const db = new sqlite3.Database(path.join(__dirname, "stzysk4.db"));

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
        return await fetch(
            "https://qms.stzy.com/matrix/zw-search/api/v1/homeEs/question/keyPointQuery",
            {
                credentials: "omit",
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
                    Accept: "application/json, text/plain, */*",
                    "Accept-Language":
                        "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
                    "Content-Type": "application/json",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
                    Priority: "u=0",
                },
                referrer: "https://zj.stzy.com/",
                body: `{"onlyCheckUrlAndMethod":true,"pageNum":1,"pageSize":10,"params":{"studyPhaseCode":"300","subjectCode":"9","searchType":2,"sort":0,"yearCode":"","gradeCode":"","provinceCode":"${o.provinceCode}","cityCode":"","areaCode":"","organizationCode":"","termCode":"","paperType":"${o.paperType}","showQuestionTypeCode":"${o.showQuestionTypeCode}","questionParentCode":"${o.showQuestionTypeCode}","diffcultCode":"${o.diffcultCode}","questionFeatureCode":"","questionMethodCode":"","capacityMethod":"","situationCode":"","keyWord":"","filterQuestionFlag":false,"searchScope":0,"treeIds":["${o.treeid}"]}}`,
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
        e.showQuestionTypeCode || 0,
        e.provinceCode || 0,
        e.questionFeatureName || 0,
        e.questionMethodName || 0,
    );
}
var errb = [];
/*分类
忽略以及该项有无


paperType["22","1","2","3","4","5","6","7","8","12","13","14","15","10","9","16","19",""]以及该项有无
provinceCode["-1","110000","120000","130000","140000","150000","210000","220000","230000","310000","320000","330000","340000","350000","360000","370000","410000","420000","430000","440000","450000","460000","500000","510000","520000","530000","540000","610000","620000","630000","640000","650000",""]以及该项有无
showQuestionTypeCode["1","2","39","187","4","5","295","188",""]以及该项有无
diffcultCode["1","2","3","4","5",""]以及该项有无
sort[0,1,2]
*/
var LpaperType = [
    ["22", "1", "2"],
    ["3", "4", "5"],
    ["6", "7", "8"],
    ["12", "13", "14"],
    ["15", "10", "9"],
    ["16", "19", ""],
];
var LprovinceCode = [
    "-1",
    "110000",
    "120000",
    "130000",
    "140000",
    "150000",
    "210000",
    "220000",
    "230000",
    "310000",
    "320000",
    "330000",
    "340000",
    "350000",
    "360000",
    "370000",
    "410000",
    "420000",
    "430000",
    "440000",
    "450000",
    "460000",
    "500000",
    "510000",
    "520000",
    "530000",
    "540000",
    "610000",
    "620000",
    "630000",
    "640000",
    "650000",
    "",
];
var LshowQuestionTypeCode = ["1", "2", "39", "187", "4", "5", "295", "188", ""];
var LdiffcultCode = ["1", "2", "3", "4", "5", ""];
async function getter(treeid) {
    try {
        var gl = [];
        for (var i1 = 0; i1 < LprovinceCode.length; i1++) {
            for (var i5 = 0; i5 < LdiffcultCode.length; i5++) {
                fs.writeFileSync("0.txt", `i1=${i1 + 1}/33,i5=${i5 + 1}/6`);
                for (var i7 = 0; i7 < LshowQuestionTypeCode.length; i7++) {
                    for (var i8 = 0; i8 < LpaperType.length; i8++) {
                        LpaperType[i8].forEach((PapperType) => {
                            gl.push(
                                new Promise((resolve, reject) => {
                                    process.stdout.write(
                                        `\r${i1 + 1}/33 ${i5 + 1}/6 ${i7 + 1}/9 ${i8 + 1}/6                            `,
                                    );
                                    got(1, {
                                        provinceCode: LprovinceCode[i1],
                                        paperType: PapperType,
                                        showQuestionTypeCode:
                                            LshowQuestionTypeCode[i7],
                                        diffcultCode: LdiffcultCode[i5],
                                        treeid: treeid,
                                    }).then((r) => {
                                        if (r.code != 200) {
                                            stmt.finalize();
                                            db.close((err) => {
                                                if (err) console.error(err);
                                                else console.log("✅ 写入完成");
                                            });
                                            console.log(r);
                                            errb.push([
                                                treeid,
                                                [i1, i5, i7, i8],
                                            ]);
                                        }
                                        r.data.list.forEach((e) => {
                                            fn(e);
                                        });
                                        resolve(1);
                                    });
                                }),
                            );
                        });
                        await Promise.all(gl);
                        gl = [];
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        errb.push([treeid]);
    }
}
var b = JSON.parse(String(fs.readFileSync("k.json")));

async function bian(arr) {
    for (var i = 0; i < arr.length; i++) {console.log(arr[i])
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
bian(b.slice(3, 4));
