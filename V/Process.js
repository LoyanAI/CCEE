function process0(j){
    var t='';
    var tab='';
    if(j.main){
        t+=`${j.main.word} ${j.main.speech}.`;
        tab+='  ';
    }
    if(j.phrase){
        var mainid=1;
        for(var i=0;i<j.phrase.length;i++){
            var s=j.phrase[i];
            if((s.form||s.example)&&j.main&&t[t.length-1]!='\n'){
                t+='\n';
            }
            if(s.main){
                //t+=`${tab}[${mainid}]${s.main.speech} ${s.main.use} ${s.main.chin}`;mainid++;
                t+=`${tab}${s.main.speech?(s.main.speech+" "):''}${s.main.use?(s.main.use+' '):''}${s.main.chin.replaceAll("；",',')}`;mainid++;
                if((s.form||s.example)&&t[t.length-1]!='\n'){t+="\n"}else{
                    t+=';'
                }
                tab+='  ';
            }
            if(s.example){
                for(k in s.example){
                    if(s.example[k].highlight){
                        t+=`${tab}${s.example[k].highlight}\n`
                    }else{
                        t+=`${tab}${s.example[k].main.eng}${s.example[k].main.chin}\n`
                    }
                }
            }
            if(s.form){
                for(k in s.form){
                    t+=`${tab}${s.form[k].main.form}\n` 
                    tab+='  ';
                    if(s.form[k].example){
                        for(ke in s.form[k].example){
                            if(s.form[k].example[ke].main.highlight){
                                t+=`${tab}${s.form[k].example[ke].main.highlight}\n`
                            }else{
                                t+=`${tab}${s.form[k].example[ke].main.eng}${s.form[k].example[ke].main.chin}\n`
                            }
                        }
                    }
                    tab=tab.slice(0,-2)
                }
            }
            if(s.main){tab=tab.slice(0,-2)}
            
        }
        
    }
    if(j.main){
        tab=tab.slice(0,-2)
    }
    if(j.derivative){
        tab+='  ';
        t+=`=>${j.derivative.map(e=>`${e.main.eng} ${e.main.speech}${e.main.use?(" "+e.main.use):''}`).join(',')}\n`
        tab=tab.slice(0,-2)
    }
    t=t.replaceAll(':','').replaceAll("：",'');
    if(t[t.length-1]!='\n'){t+='\n'}
    return t;
}