const cheerio=require("cheerio")

const y=['44912'];

function p0(QuesRoot){
    var f=QuesRoot.children('.ques-additional').children('.msg-box');
    var question=QuesRoot.find('.quesdiv').text().replace(/[\t\n\r]/g, '').replaceAll(/[ \u3000\s]{2,}/g,' ').replace(/^ *[0-9]+ \. */g,'');
    //console.log(QuesRoot)
    var difficulty=f.children('.left-msg').children('.addi-info').text().match(/\([0-9\.]+?\)/g)[0].slice(1,-1);
    var knowledge=f.find('.knowledge-item').map((a,b)=>b.attribs.href).get();
    var method=f.find('.method-list > a.item').map((a,b)=>b.attribs.href).get();
    return {q:question,d:difficulty,k:knowledge,m:method}
}
all=[];
function p(shtml){
    var $=cheerio.load(shtml);
    $('.quesroot').each((i,e)=>all.push(p0($(e))));
}
async function lister(page,t,kid){
return await fetch("https://zujuan.xkw.com/zujuan-api/question/list", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh-CN,zh;q=0.9",
    "content-type": "application/x-www-form-urlencoded",
    "requestverification": "CfDJ8PaMwn-k60ZPi-hzvnsv1hvkdXeX_Qs2hSAVz6hUUL0QrzJhJ0drKPXp8dFxZuNlGJ1lOJ6hRCWJvt3wjZkvqyY7W_CElMyydnBpuDqve-envFyAks32S-XHtiBQBVcgDqWp2aFZkc0gcvzR-HEGs40",
    "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://zujuan.xkw.com/",
  "body": `pageName=zsd&bankId=15&courseId=0&categoryId=${kid}&canCategoryId=false&categoryIds%5B0%5D=0&quesType=3${t}&quesDiff=0&quesYear=0&paperTypeId=0scenarioizedTypeId=0&tagId=0&provinceId=-1&learngrade=0&term=0&orderBy=2&curPage=${page}&quesAttributeId=0&examMethodId=0&isFresh=0&catelogTokpointId=0`,
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
}).then(e=>e.json()).then(e=>e.data.html)
}

const fs=require('fs')
async function scan(Knowid){
    var t=[101,103,104,105,106,107,108];
    for(var i=0;i<t.length;i++){
        for(var page=1;page<=1000;page++){
            console.log(page)
            var w=await lister(page,t[i],Knowid);
            if(w.indexOf("empty-ques-list")+1){
                break;
            }
            p(w);
        }
    }
    fs.writeFileSync("t.json",JSON.stringify(all))
}

 function g(s){var t=[];if(s.children){s.children.forEach(e=>t=t.concat(g(e)))};t.push(s.href);return t;}
scan(y[0]);