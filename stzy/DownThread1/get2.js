const sqlite3 = require("sqlite3").verbose();
const { resolve } = require("dns");
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "stzy197.db"));

// 2) 建表（只建一次即可）
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      qid        TEXT    NOT NULL,
      q          TEXT    NOT NULL,
      d          TEXT,
      k          TEXT,   
      f          TEXT,
      m          TEXT
    )
  `);
});
var stmt = db.prepare(`
    INSERT INTO questions (qid, q, d, k, f, m)
    VALUES (?, ?, ?, ?, ?, ?)
`);

async function got(page, treeid, h) {
    process.stdout.write(`\r${page} ${treeid} ${h}      `);
    try {
        return await fetch(
            "https://qms.stzy.com/matrix/zw-search/api/v1/homeEs/question/textbookQuery",
            {
                credentials: "omit",
                headers: {
                    accept: "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "content-type": "application/json",
                    "sec-ch-ua":
                        '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                },
                referrer: "https://zj.stzy.com/",
                body:
                    '{"pageNum":' +
                    page +
                    ',"pageSize":10,"params":{"studyPhaseCode":"300","subjectCode":"9","textbookVersionCode":"1","ceciCode":"197","searchType":1,"sort":0,"yearCode":"","gradeCode":"","provinceCode":"","cityCode":"","areaCode":"","organizationCode":"","termCode":"","paperType":"' +
                    lp[h] +
                    '","showQuestionTypeCode":"","questionParentCode":"","diffcultCode":"","keyWord":"","filterQuestionFlag":false,"searchScope":0,"treeIds":["' +
                    treeid +
                    '"],"categoryId":""}}',
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
        e.questionFeatureName || 0,
        e.questionMethodName || 0,
    );
}
var errb = [];
var lp = [
    "22",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "12",
    "13",
    "14",
    "15",
    "10",
    "9",
    "16",
    "19",
];
async function getter(treeid) {
    try {
        var gl = [];
        for (var h = 0; h < lp.length; h += 4) {
            lp.slice(h, h + 4).forEach((dy, i) => {
                gl.push(
                    new Promise((resolve, reject) => {
                        got(1, treeid, h + i).then((r) => {
                            if (r.code != 200) {
                                console.log(r);
                                err.push([1, treeid, h + i]);
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
    } catch (err) {
        console.log(err);
        err.push([treeid]);
    }
}
var b = [
    "35169",
    "35170",
    "35171",
    "35172",
    "35173",
    "35174",
    "35175",
    "35176",
    "35177",
    "35178",
    "35168",
    "35181",
    "35182",
    "35183",
    "149834",
    "35184",
    "133228",
    "133229",
    "149835",
    "35180",
    "133230",
    "35186",
    "35187",
    "35188",
    "133231",
    "35185",
    "35179",
    "35191",
    "35192",
    "35190",
    "125842",
    "35167",
    "35198",
    "35199",
    "35200",
    "35197",
    "35202",
    "35201",
    "35196",
    "35205",
    "35206",
    "35207",
    "35204",
    "35209",
    "35210",
    "35211",
    "35208",
    "35213",
    "35214",
    "35212",
    "35203",
    "35217",
    "35218",
    "35219",
    "35216",
    "35221",
    "35222",
    "35223",
    "35224",
    "35220",
    "35215",
    "125836",
    "35195",
    "35229",
    "35230",
    "35231",
    "35232",
    "35228",
    "35234",
    "35235",
    "133232",
    "133233",
    "35236",
    "35237",
    "133234",
    "35238",
    "35233",
    "35240",
    "35239",
    "35242",
    "35243",
    "35241",
    "125832",
    "35227",
    "125828",
    "35249",
    "35248",
    "35251",
    "35253",
    "35250",
    "35255",
    "35256",
    "35254",
    "125823",
    "35247",
    "125820",
    "270",
];

async function bian(arr) {
    for (var i = 0; i < arr.length; i++) {
        await getter(arr[i]);
        console.log(`\n[${i + 1}/${arr.length}]`);
        stmt.finalize();
        stmt = db.prepare(`
            INSERT INTO questions (qid, q, d, k, f, m)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
    }

    stmt.finalize();
    db.close((err) => {
        if (err) console.error(err);
        else console.log("✅ 写入完成");
    });
}
bian(b);
