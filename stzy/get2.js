const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'stzy.db'));

// 2) 建表（只建一次即可）
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      q          TEXT    NOT NULL,
      d          TEXT,
      k          TEXT,   
      f          TEXT,
      m          TEXT
    )
  `);
});
var stmt = db.prepare(`
    INSERT INTO questions (q, d, k, f, m)
    VALUES (?, ?, ?, ?, ?)
`);

async function got(page,treeid,h){
    console.log(page,treeid,h)
    try{
        return await fetch("https://qms.stzy.com/matrix/zw-search/api/v1/homeEs/question/textbookQuery", {
            "credentials": "omit",
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9",
                "content-type": "application/json",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "referrer": "https://zj.stzy.com/",
            "body": "{\"pageNum\":"+page+",\"pageSize\":10,\"params\":{\"studyPhaseCode\":\"300\",\"subjectCode\":\"9\",\"textbookVersionCode\":\"1\",\"ceciCode\":\"193\",\"searchType\":1,\"sort\":0,\"yearCode\":\"\",\"gradeCode\":\"\",\"provinceCode\":\"\",\"cityCode\":\"\",\"areaCode\":\"\",\"organizationCode\":\"\",\"termCode\":\"\",\"paperType\":\""+lp[h]+"\",\"showQuestionTypeCode\":\"\",\"questionParentCode\":\"\",\"diffcultCode\":\"\",\"keyWord\":\"\",\"filterQuestionFlag\":false,\"searchScope\":0,\"treeIds\":[\""+treeid+"\"],\"categoryId\":\"\"}}",
            "method": "POST",
            "mode": "cors"
        }).then(e=>e.json());
    }catch(err){
        console.log(err)
    }
    
}
var all=[];
function fn(e){
    stmt.run(
    e.questionArticle,
    e.diffcultCode,
    e.keyPointIds,
    e.questionFeatureName || 0,
    e.questionMethodName  || 0
    );
}
var lp=["22","1","2","3","4","5","6","7","8","12","13","14","15","10","9","16","19"];
async function getter(treeid){
    try{
        for(var h=0;h<lp.length;h++){
            var r=await got(1,treeid,h);
            if(r.code!=200){
                db.close((err) => {
                    if (err) console.error(err);
                    else console.log('✅ 写入完成');
                });process.exit(1);
            }
            r.data.list.forEach(e=>{
                fn(e)
            })
        }
        db.close((err) => {
            if (err) console.error(err);
            else console.log('✅ 写入完成');
        });
    }catch(err){
        db.close((err) => {
            if (err) console.error(err);
            else console.log('✅ 写入完成');
        });
        console.log(err)
    }
}
var b=["34681","34682","34683","34680","34685","34687","34686","34684","34679","34690","133192","34691","34689","34693","143708","143709","143707","34696","34692","34698","34699","143712","34700","34697","34702","34703","34704","34705","34706","34707","34701","34709","34710","34711","34712","34713","34714","34715","34708","125423","125424","34688","34721","34723","34724","34722","34720","34726","133212","133213","133214","133215","133211","34729","34730","143719","143720","143721","143716","133193","34725","34735","34736","34737","143729","34734","133421","125425","125427","34719","34743","34744","34745","34746","34747","34748","143806","34742","34750","34751","34752","34753","34749","125429","34741","34759","34760","34761","34762","34758","34764","34765","34763","34757","34767","34768","34769","34770","34766","133194","34778","34773","34774","34775","34776","34777","34779","34780","34781","34772","34784","34785","109370","34783","34788","34789","34790","143734","143736","143733","105675","34787","133195","34782","133197","133198","143747","133200","143750","133196","133201","133202","125430","34756","34807","34808","34809","34810","34811","144308","34805","34813","34804","34815","143760","143761","143759","34814","34819","34822","34820","149870","143769","143770","143768","133203","133204","34818","125431","34803","125432","266"]

async function bian(arr) {
    for(var i=0;i<arr.length;i++){
        await getter(arr[i])
        stmt.finalize();
        stmt = db.prepare(`
            INSERT INTO questions (q, d, k, f, m)
            VALUES (?, ?, ?, ?, ?)
        `);
    }
    db.close((err) => {
        if (err) console.error(err);
        else console.log('✅ 写入完成');
    });
}
bian(b.slice(0,2))
