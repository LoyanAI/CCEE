id=0
for(var i=0;i<m.length;i++){
    if(!g.includes(id)){
        delete m[i].main;id++;
    }else{
        m[i].id=id;id++;
    }
    if(m[i].phrase){
        for(var j=0;j<m[i].phrase.length;j++){
            if(!g.includes(id)){
                delete m[i].phrase[j].main;id++;
            }else{
                m[i].phrase[j].id=id;id++;
            }
            if(m[i].phrase[j].example){
                for(var k=0;k<m[i].phrase[j].example.length;k++){
                    if(!g.includes(id)){
                        delete m[i].phrase[j].example[k].main;id++;
                    }else{
                        m[i].phrase[j].example[k].id=id;id++;
                    }
                }
            }
            if(m[i].phrase[j].form){
                for(var k=0;k<m[i].phrase[j].form.length;k++){
                    if(!g.includes(id)){
                        delete m[i].phrase[j].form[k].main;id++;
                    }else{
                        m[i].phrase[j].form[k].id=id;id++;
                    }
                    if(m[i].phrase[j].form[k].example){
                        for(var r=0;r<m[i].phrase[j].form[k].example.length;r++){
                            if(!g.includes(id)){
                                delete m[i].phrase[j].form[k].example[r].main;id++;
                            }else{
                                m[i].phrase[j].form[k].example[r].id=id;id++;
                            }
                        }
                    }
                }

            }
        }
    }
    if(m[i].derivative){
        for(var j=0;j<m[i].derivative.length;j++){
            if(!g.includes(id)){
                delete m[i].derivative[j].main;id++;
            }else{
                m[i].derivative[j].id=id;id++;
            }

        }
    }
}