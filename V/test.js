const F = async function (id) {
    return JSON.parse(JSON.parse(await fetch(
        "http://test.weicistudy.com:83/gaozhong/weici/teach/basic/word/info",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body:
                "word_id=" +
                id +
                "&user_code=15321996586&session=d8611096f0dd469ba9442424d76c86e6&app_id=9&version_id=9",
        },
    ).then((e) => e.text())
    ).word_info.detail_json)
};
module.exports=F;