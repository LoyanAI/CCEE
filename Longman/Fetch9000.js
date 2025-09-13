const cheerio = require('cheerio');
const fs=require('fs');

const w=JSON.parse(String(fs.readFileSync("lm.json")));
async function p(Speed=20){
    console.log("Start")
    try{
        var po=0;
        var u={};
        var gl=[];
        for(var i=0;i<w.length;i+=Speed){
            for(let x=0;x<Speed;x++){po++;
                process.stdout.write("\r"+po+'         ')
                gl.push(
                    new Promise((resolve,reject)=>{
                        try{
                            fetch("https://www.ldoceonline.com/dictionary/"+w[i+x]).then(e=>e.text()).then(r=>{
                                const $ = cheerio.load(r);
                                var classes = [...new Set(
                                    $('div.dictionary').find('*').addBack()
                                        .map((i, el) => $(el).attr('class'))
                                        .get()
                                        .filter(Boolean)
                                        .join(' ')
                                        .split(/\s+/))
                                ];
                                for(j in classes){
                                    u[classes[j]]=w[i+x];
                                }
                                resolve();
                            })
                        }catch(err){
                            console.log(err)
                        }
                    })
                )
            }
            await Promise.all(gl);
            gl=[];
        }
        fs.writeFileSync("Classes.json",JSON.stringify(u))
    }catch(err){
        fs.writeFileSync("Classes.json",JSON.stringify(u))
        console.log(err)
    }
}
p();

