await fetch("https://qms.stzy.com/matrix/zw-search/api/v1/homeEs/question/textbookQuery", {
    "credentials": "omit",
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
    "referrer": "https://zj.stzy.com/",
    "body": "{\"pageNum\":1,\"pageSize\":10,\"params\":{\"studyPhaseCode\":\"300\",\"subjectCode\":\"9\",\"textbookVersionCode\":\"1\",\"ceciCode\":\"193\",\"searchType\":1,\"sort\":0,\"yearCode\":\"\",\"gradeCode\":\"\",\"provinceCode\":\"\",\"cityCode\":\"\",\"areaCode\":\"\",\"organizationCode\":\"\",\"termCode\":\"\",\"keyWord\":\"\",\"filterQuestionFlag\":false,\"searchScope\":0,\"treeIds\":[\"34683\"],\"categoryId\":\"\"}}",
    "method": "POST",
    "mode": "cors"
});
await fetch("https://qms.stzy.com/matrix/zw-search/api/v1/homeEs/question/textbookQuery", {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
        "Content-Type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
    },
    "referrer": "https://zj.stzy.com/",
    "body": "{\"pageNum\":2,\"pageSize\":10,\"params\":{\"studyPhaseCode\":\"300\",\"subjectCode\":\"9\",\"textbookVersionCode\":\"1\",\"ceciCode\":\"193\",\"searchType\":1,\"sort\":0,\"yearCode\":\"\",\"gradeCode\":\"\",\"provinceCode\":\"\",\"cityCode\":\"\",\"areaCode\":\"\",\"organizationCode\":\"\",\"termCode\":\"\",\"paperType\":\"1\",\"showQuestionTypeCode\":\"\",\"questionParentCode\":\"\",\"diffcultCode\":\"\",\"keyWord\":\"\",\"filterQuestionFlag\":false,\"searchScope\":0,\"treeIds\":[\"34686\"],\"categoryId\":\"\"}}",
    "method": "POST",
    "mode": "cors"
}).then(e=>e.json())


await fetch("https://qms.stzy.com/matrix/zw-zzw/api/v1/zzw/tree/textbook", {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
        "Content-Type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
    },
    "referrer": "https://zj.stzy.com/",
    "body": "{\"studyPhaseCode\":\"300\",\"subjectCode\":\"9\",\"textbookVersionCode\":\"1\",\"ceciCode\":\"193\",\"gradeCode\":\"10\"}",
    "method": "POST",
    "mode": "cors"
});

["22","1","2","3","4","5","6","7","8","12","13","14","15","10","9","16","19"]