/*
Word{
    main,
    phrase{
        main,
        example{main},
        form{
            main,
            example{main}
        }
    },
    derivative{main}
}
*/
id=0
for(var i=0;i<m.length;i++){
    m[i].id=id;id++;
    if(m[i].phrase){
        for(var j=0;j<m[i].phrase.length;j++){
            m[i].phrase[j].id=id;id++;
            if(m[i].phrase[j].example){
                for(var k=0;k<m[i].phrase[j].example.length;k++){
                    m[i].phrase[j].example[k].id=id;id++;
                }
            }
            if(m[i].phrase[j].form){
                for(var k=0;k<m[i].phrase[j].form.length;k++){
                    m[i].phrase[j].form[k].id=id;id++;
                    if(m[i].phrase[j].form[k].example){
                        for(var r=0;r<m[i].phrase[j].form[k].example.length;r++){
                            m[i].phrase[j].form[k].example[r].id=id;id++;
                        }
                    }
                }

            }
        }
    }
    if(m[i].derivative){
        for(var j=0;j<m[i].derivative.length;j++){
            m[i].derivative[j].id=id;id++;

        }
    }
}