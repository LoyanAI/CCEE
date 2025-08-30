/*
{
  word: 'access',
  part_of_speech: 'n',
  use_method: '[U]',
  gy_paraphrase: [
    {
      id: 1529,
      frequency_name: '高义频',
      part_of_speech: '',
      use_method: '',
      chinese: '通道；入口',
      english: 'a way of reaching or entering a place：',
      gy_example: [
        {
          id: 23221,
          english: 'The police gained access through a broken window.',
          chinese: '警察从一扇破窗中钻了进去。',
          highlight: 'gained access'
        }
    ],
    }
  ]
}

*/
function sExample(obj){
    var t={};
    t.id=obj.id;
    t.main={highlight:obj.highlight,eng:obj.english,chin:obj.chinese}
    return t;
}
function sForm(obj){
    t={};
    t.id=obj.id;
    t.main={form:obj.sentential_form};
    if(obj.gy_example&&obj.gy_example.length){
        t.example=obj.gy_example.map(e=>sExample(e))
    }
    return t;
}
function sPhrase(obj){
    var t={};
    t.id=obj.id;
    t.main={speech:obj.part_of_speech,use:obj.use_method,chin:obj.chinese,eng:obj.english}
    if(obj.gy_example&&obj.gy_example.length){
        t.example=obj.gy_example.map(e=>sExample(e))
    }
    if(obj.gy_sentential_form&&obj.gy_sentential_form.length){
        t.form=obj.gy_sentential_form.map(e=>sForm(e))
    }
    return t;
}
function sDer(obj){
    var t={};
    t.id=obj.id;
    t.main={speech:obj.part_of_speech,use:obj.use_method,eng:obj.derivative_word}
    /*if(obj.gy_example&&obj.gy_example.length){
        t.example=obj.gy_example.map(e=>sExample(e))
    }
    if(obj.gy_paraphrase&&obj.gy_paraphrase.length){
        t.phrase=obj.gy_paraphrase.map(e=>sPhrase(e))
    }*/
    return t;
}
function sWord(obj){
    var t={};
    t.main={speech:obj.part_of_speech,word:obj.word}
    if(obj.gy_paraphrase&&obj.gy_paraphrase.length){
        t.phrase=obj.gy_paraphrase.map(e=>sPhrase(e))
    }
    if(obj.gy_derivative&&obj.gy_derivative.length){
        t.derivative=obj.gy_derivative.map(e=>sDer(e))//词汇变形
    }
    return t;
}
module.exports=sWord;
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