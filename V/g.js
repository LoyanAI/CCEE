const fs = require("fs");
const db = require("./db").insert;
const F = async function (id) {
    return await fetch(
        "http://test.weicistudy.com:83/gaozhong/weici/teach/basic/word/info",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body:
                "word_id=" +
                id +
                "&user_code=15321996586&session=d8611096f0dd469ba9442424d76c86e6&app_id=9&version_id=9",
        },
    ).then((e) => e.text());
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const d = JSON.parse(String(fs.readFileSync("words.json")));
(async function () {
    var err = [];

    for (var i = 9100; i < d.length; i++) {
        try {
            console.log(i + "/" + d.length, d[i].b);
            await db(d[i].a + "", await F(d[i].a));
            await sleep(50);
        } catch (er) {
            console.log(er);
            err.push(d[i].a);
            console.log("An err on" + d[i].a);
            continue;
        }
    }
    console.log(JSON.stringify(err));
})();
