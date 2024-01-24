const add_pos = document.getElementById("add_pos")
const submit = document.getElementById("submit")
const body = document.getElementById("body")
const us_sound = document.getElementById('us-sound')
const uk_sound = document.getElementById('uk-sound')
let clone_pos = document.getElementById("pos-0").cloneNode(true)
let clone_meaning = document.getElementById("meaning").cloneNode(true)
let clone_example = document.getElementById("example").cloneNode(true)
let hr = document.createElement("hr")
var meanings = []
var max_pos = 1
var wordList
var url_us, url_uk

//read word list
fetch("static/english.txt")
  .then((res) => res.text())
  .then((text) => {
    wordList = text.split("\n")
   })
  .catch((e) => console.error(e));

class word {
    constructor(english, phonetics, partOfSpeechs){
        this.english = english
        this.phonetics = phonetics
        this.partOfSpeechs = partOfSpeechs
    }
}

class phonetic {
    constructor(us, uk){
        this.us = us
        this.uk = uk
    }
}

class partOfSpeech {
    constructor(pos, meanings){
        this.pos = pos
        this.meanings = meanings
    }
}

class meaning {
    constructor(mean, example){
        this.mean = mean
        this.example = example
    }
}

meanings[0] = 1
document.getElementById("add_meaning-0").setAttribute("onclick",`add_meaning("add_meaning-0")`)
function add_meaning(id){
    let pos = id.slice(12, 13)
    meanings[pos] += 1
    clone_meaning.querySelector("input").id= "meaning-" + pos + "-" + meanings[pos]
    clone_example.querySelector("textarea").id = "example-" + pos + "-" + meanings[pos]
    let partOfSpeech = document.getElementById("pos-"+pos)
    partOfSpeech.insertBefore(hr, partOfSpeech.lastElementChild.previousSibling)
    partOfSpeech.insertBefore(clone_meaning, partOfSpeech.lastElementChild.previousSibling)
    partOfSpeech.insertBefore(clone_example, partOfSpeech.lastElementChild.previousSibling)
    clone_meaning = clone_meaning.cloneNode(true)
    clone_example = clone_example.cloneNode(true)
    hr = document.createElement("hr")
}

function del_meaning(id){

}

document.getElementById("del_pos-0").setAttribute("onclick", `del_pos("pos-0")`)
function del_pos(id){
    let del = document.getElementById(id)
    del.remove()
    meanings[id.slice(4, 5)] = 0
}

add_pos.onclick = () => {
    meanings[max_pos] = 1
    clone_pos.id = "pos-" + max_pos
    let term = clone_pos.querySelector("#meaning-0-1")
    term.id = "meaning-" + max_pos + "-1"
    term = clone_pos.querySelector("#example-0-1")
    term.id = "example-" + max_pos + "-1"
    term = clone_pos.querySelector("select")
    term.id = "pofs-" + max_pos
    body.insertBefore(clone_pos, body.lastElementChild.previousSibling.previousSibling)
    let btn = body.children[body.children.length-3].querySelector("i")
    btn.id = "add_meaning-" + max_pos
    btn.setAttribute("onclick",`add_meaning("` + btn.id + `")`)
    btn = body.children[body.children.length-3].children[0].querySelector("button")
    btn.id = "del_pos-" + max_pos
    btn.setAttribute("onclick", `del_pos("pos-` + max_pos + `")`)
    clone_pos = clone_pos.cloneNode(true)
    max_pos ++
}

//check word
const word_box = document.getElementById('word')
const warning = document.getElementById('warning')
word_box.onkeyup = (e) => {
    let word = e.target.value
    if (wordList.includes(word + '\r')){
        warning.style.display = 'block'
    }
    else {
        warning.style.display = 'none'
    }
}

//submit 
submit.onclick = () => {
    if (document.getElementById('warning').style.display == 'none'){
        let w = new word()
        w.english = document.getElementById("word").value
        let phonetics = new phonetic(document.getElementById("us-text").value, document.getElementById("uk-text").value)
        w.phonetics = phonetics
        let type = document.getElementById("type").value
        let pos_arr = []
        for (let i = 0; i < max_pos; i++ ){
            let meaning_arr = []
            if (meanings[i] > 0){
                let p = new partOfSpeech()
                for (let j = 1; j <= meanings[i]; j++){
                    let term = new meaning()
                    term.mean = document.getElementById("meaning-"+i+"-"+j).value
                    term.example = document.getElementById("example-"+i+"-"+j).value
                    meaning_arr[j-1] = term
                }
                p.meanings = meaning_arr
                p.pos = document.getElementById("pofs-"+i).value
                pos_arr.push(p)
            }
        }
        w.partOfSpeechs = pos_arr
        console.log(w)
    
        var sound = new XMLHttpRequest();
        var formData = new FormData();
        if (us_sound.files.length === 0){
            formData.append('us_blank', 'y')
        } else {
            formData.append('us_blank', 'n')
            formData.append('us_sound', us_sound.files[0])
        }
        if (uk_sound.files.length === 0){
            formData.append('uk_blank', 'y')
        } else {
            formData.append('uk_sound', uk_sound.files[0])
            formData.append('uk_blank', 'n')
        }
        
        formData.append('word', w.english)
        sound.open('POST', '/save_file', true)
        sound.onload = function () {
            if (sound.status == 200) {
                console.log(1)
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/process_data', true);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        if (!wordList.includes(w.english)){
                            wordList.push(w.english)
                        }
                        location.replace("http://127.0.0.1:5000/dictionary")
                        alert("addition successful")
                    }
                };
            
                var data = JSON.stringify({ 'myVariable': w, 'type': type });
                xhr.send(data);
            }
        };
        sound.send(formData)
    }
    else {
        alert("This word has already in the dictionary. Please add another word.")
    }
}
