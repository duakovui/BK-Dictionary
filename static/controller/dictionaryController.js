const searchWrapper = document.getElementById("search");
const inputBox = searchWrapper.querySelector("input");
const suggBox = document.getElementById("suggestion");
const icon = searchWrapper.querySelector("button");
const content = document.getElementById("content");
const type = searchWrapper.querySelector("select")
var wordList;

//search
icon.onclick = () => {  
    location.assign("http://127.0.0.1:5000/word="+inputBox.value+"&typeOfDict="+type.value) 
}

function search(){
    suggBox.style.visibility = 'hidden' 
    let character = inputBox.value;
    const rq = new XMLHttpRequest();
    rq.open('GET', `https://api.dictionaryapi.dev/api/v2/entries/en/${character}`);   
    rq.responseType = "json"; 
    rq.onload = () => {
        let status = rq.status
        if (status == 200){
            let data = rq.response;
            content.innerHTML = `<strong style="font-size: xx-large; margin-right: 10px;">`+data[0].word+`</strong>`;
            for(let i=0; i<data[0].meanings.length; i++){
                content.innerHTML += `<span>`+data[0].meanings[i].partOfSpeech+`</span>`;
                if (i<data[0].meanings.length-1){
                    content.innerHTML += `<span>`+", "+`</span>`;
                }
            } 
    
            //audio
            content.innerHTML += `<div class="row">`
            let count=0;
            for(let i=0; i<data[0].phonetics.length; i++){        
                if ((data[0].phonetics[i].text!=undefined)&&(data[0].phonetics[i].audio!=undefined)&&(data[0].phonetics[i].text!="")&&(data[0].phonetics[i].audio!="")){
                    count++;
                    if (count==1){
                        content.innerHTML += `<span style="margin-right: 30px">UK <i class="fa-solid fa-volume-high" 
                            onclick="play_sound('`+data[0].phonetics[i].audio+`')"></i>`+data[0].phonetics[i].text+`</span>`
    
                    }
                    else {
                        content.innerHTML += `<span>US <i class="fa-solid fa-volume-high"
                            onclick="play_sound('`+data[0].phonetics[i].audio+`')"></i>`+data[0].phonetics[i].text+`</span>`
                    }
                }
            } 
            content.innerHTML += '</div>'
    
            //meaning
            if (type.value == 0){
                fetch("https://dict.laban.vn/ajax/find?type=1&query=" + encodeURIComponent(character) + "&vi=" + hasVietnamese(character))
                .then((response) => response.json())
                .then((data) => {
                    content.innerHTML += data.enViData.best.details;
                    let element = content.querySelector(".world");
                    element.parentNode.removeChild(element)
                    let list = content.getElementsByClassName("bg-grey")
                    for (element of list){
                        let newNode = document.createElement("hr")
                        newNode.style = "border-top: 3px solid purple"
                        element.parentNode.insertBefore(newNode, element)
                        element.classList.remove("bold", "font-large", "m-top20")
                        element.classList.add("partOfSpeech")
                    }
                    list = content.getElementsByClassName("green")
                    for (element of list){
                        let newNode = document.createElement("hr")
                        element.parentNode.insertBefore(newNode, element)
                        element.classList.remove("margin25", "m-top15")
                        if (hasVietnamese(element.innerText)){
                            element.innerText = '• ' + element.innerText
                            element.classList.add('definition')
                        }
                        else {
                            console.log(element.innerText)
                            element.innerHTML = '<span>• </span>'+add_link_1(element.innerText.match(/[\w']+|[^\w\s]/g), 'definition')
                            console.log(element.innerHTML)
                        }   
                    }
                    list = content.getElementsByClassName("color-light-blue")
                    for (element of list){
                        element.innerHTML = "<span>Ví dụ: </span>" + add_link_1(element.innerText.match(/[\w']+|[^\w\s]/g), 'example')
                        element.classList.remove("margin25")
                        element.style = "margin-left: 10px"
                    }
                    list = content.getElementsByClassName("dot-blue")
                    for (element of list){
                        let newNode = document.createElement("hr")
                        element.parentNode.insertBefore(newNode, element)
                        element.classList.remove("bold", "m-top15")
                        if (hasVietnamese(element.innerText)){
                            element.innerText = '• ' + element.innerText
                            element.classList.add('definition')
                        }
                        else {
                            console.log(element.innerText)
                            element.innerHTML = '<span>• </span>'+add_link_1(element.innerText.match(/[\w']+|[^\w\s]/g), 'definition')
                            console.log(element.innerHTML)
                        }  
                    }
                    list = content.getElementsByClassName("margin25")
                    for (element of list){
                        if (element.querySelector('a') !== null){
                            element.style = 'display: none'
                        }
                        else
                            element.style = "margin-left: 55px"
                    }
                    list = content.getElementsByClassName("grey")
                    for (element of list){
                        element.style = "margin-left: 10px; font-weight: bold; font-style: italic;"
                    }
                })
            } 
            else{
                content.innerHTML += `<div class="row">`
                for(let i=0; i<data[0].meanings.length; i++){
                    content.innerHTML += `<hr style="border-top: 3px solid purple">`
                    content.innerHTML += `<div class="partOfSpeech">`+data[0].meanings[i].partOfSpeech+`</div>`
                    for(let j=0; j<data[0].meanings[i].definitions.length; j++){
                        content.innerHTML += `<hr><span>• </span>`
                        add_link(data[0].meanings[i].definitions[j].definition.match(/[\w']+|[^\w\s]/g), 'definition')
                        console.log(data[0].meanings[i].definitions[j].definition.match(/[\w']+|[^\w\s]/g))
                        //content.innerHTML += `<hr><div class="definition">`+data[0].meanings[i].definitions[j].definition+`</div>`
                        if (data[0].meanings[i].definitions[j].example!=undefined){
                            content.innerHTML += `<br><span style='margin-left:8px'>Example: <span>`
                            add_link(data[0].meanings[i].definitions[j].example.match(/[\w']+|[^\w\s]/g), 'example')
                            //content.innerHTML += `<div style="margin-left: 10px;">Example: `+data[0].meanings[i].definitions[j].example+`</div>`
                        }
                    }
                }
                content.innerHTML += '</div>'
            }
        }
        else {
            rq.abort()
            rq.open('POST', '/load_data', true)
            rq.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            rq.responseType = "json"
            rq.onload = function () {
                let data = rq.response
                if (rq.status == 200){
                    content.innerHTML = `<strong style="font-size: xx-large; margin-right: 10px;">`+data.english+`</strong>`;
                    for(let i=0; i<data.partOfSpeechs.length; i++){
                        content.innerHTML += `<span>`+data.partOfSpeechs[i].pos+`</span>`;
                        if (i<data.partOfSpeechs.length-1){
                            content.innerHTML += `<span>`+", "+`</span>`;
                        }
                    } 
    
                    //audio
                    content.innerHTML += `<div class="row">`
                    fetch('static/sound/'+data.english+'_uk.mp3')
                    .then(response => response.blob())
                    .then(blob => {
                      // Tạo một Object URL từ Blob
                      var objectURL = URL.createObjectURL(blob);
                      content.innerHTML += `<span style="margin-right: 30px">UK <i class="fa-solid fa-volume-high" 
                      onclick="play_sound('`+objectURL+`')"></i>`+data.phonetics.uk+`</span>`   
    
                      fetch('static/sound/'+data.english+'_us.mp3')
                      .then(response => response.blob())
                      .then(blob => {
                        // Tạo một Object URL từ Blob
                        var objectURL = URL.createObjectURL(blob);
                        content.innerHTML += `<span style="margin-right: 30px">UK <i class="fa-solid fa-volume-high" 
                        onclick="play_sound('`+objectURL+`')"></i>`+data.phonetics.us+`</span>`              
                        //meaning
                        content.innerHTML += `<div class="row">`
                        for(let i=0; i<data.partOfSpeechs.length; i++){
                            content.innerHTML += `<hr style="border-top: 3px solid purple">`
                            content.innerHTML += `<div class="partOfSpeech">`+data.partOfSpeechs[i].pos+`</div>`
                            for(let j=0; j<data.partOfSpeechs[i].meanings.length; j++){
                                //content.innerHTML += `<hr><div class="definition">`+data.partOfSpeechs[i].meanings[j].mean+`</div>`
                                content.innerHTML += `<hr><span>• </span>`
                                add_link(data.partOfSpeechs[i].meanings[j].mean.match(/[\w']+|[^\w\s]/g), 'definition')
                                if (data.partOfSpeechs[i].meanings[j].example!=""){
                                    //content.innerHTML += `<div style="margin-left: 10px;">Example: `+data.partOfSpeechs[i].meanings[j].example+`</div>`
                                    if (type == 0){
                                        content.innerHTML += `<br><span style='margin-left:8px'>Ví dụ: <span>`
                                    }
                                    else {
                                        content.innerHTML += `<br><span style='margin-left:8px'>Example: <span>`
                                    }
                                    add_link(data.partOfSpeechs[i].meanings[j].example.match(/[\w']+|[^\w\s]/g), 'example')
                                }
                            }
                        }
                        content.innerHTML += '</div>'
                      })
                      .catch(error => {
                        console.error('Lỗi khi tải tệp MP3:', error);
                      });
                      content.innerHTML += '</div>'
                    })
                    .catch(error => {
                      console.error('Lỗi khi tải tệp MP3:', error);
                    });
                }
                else {
                    if (type.value == 0){
                        content.innerHTML = '<strong>Không tìm thấy kết quả!</strong>'
                    }
                    else {
                        content.innerHTML = '<strong>Not found!</strong>'
                    }
                }
            }; 
            var d = JSON.stringify({ 'myVariable': character, 'typeOfDict': type.value });
            rq.send(d); 
        }
        content.style.visibility = "visible"
    }
    rq.send();
}

if ((default_word != '') && (default_typeOfDict != '')){
    for (op of type.options)
        if (op.value == parseInt(default_typeOfDict, 10))
            op.selected = true

    inputBox.value = default_word
    search()
}

//read word list
fetch("static/english.txt")
  .then((res) => res.text())
  .then((text) => {
    wordList = text.split("\r\n")
   })
  .catch((e) => console.error(e));

//autocomplete search suggestion
let select_item = undefined;
inputBox.onkeyup = (e)=>{
    if (e.key === "Enter"){
        if (select_item != undefined){
            inputBox.value = select_item.innerText
            select_item = undefined
        } 
        icon.onclick();
    }
    else if (e.key === "ArrowDown"){
        if (suggBox.style.visibility == "visible"){
            if (select_item == undefined){
                select_item = suggBox.querySelector("li")
                select_item.style.border = "groove"
            } else {
                select_item.style.border = "none"
                if (select_item.nextElementSibling != null){
                    select_item = select_item.nextElementSibling;
                    select_item.style.border = "groove"
                } else {
                    select_item = suggBox.firstElementChild
                    select_item.style.border = "groove"
                }
            }  
        }
    } else if (e.key === "ArrowUp"){
        if (suggBox.style.visibility == "visible"){
            if (select_item != undefined) {
                select_item.style.border = "none"
                if (select_item.previousElementSibling != null){
                    select_item = select_item.previousElementSibling;
                    select_item.style.border = "groove"
                } else {
                    select_item = suggBox.lastElementChild
                    select_item.style.border = "groove"
                }
            }  
        }
    } else{
        let userData = e.target.value; //user enetered data
        if (userData.length>1){
            suggBox.style.visibility = 'visible'
            let emptyArray = [];
            if(userData){
                emptyArray = wordList.filter((data)=>{
                    //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
                    return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
                });
                if (emptyArray.length>8) emptyArray.splice(8, emptyArray.length-8)
                emptyArray = emptyArray.map((data)=>{
                    // passing return data inside li tag
                    return data = `<li><div class="dropdown-item">${data}</div></li>`;
                });
                showSuggestions(emptyArray);
                let allList = suggBox.querySelectorAll("li");
                for (let i = 0; i < allList.length; i++) {
                    //adding onclick attribute in all li tag
                    allList[i].setAttribute("onclick", "selected(this)");
                }
            } 
        } else{
            suggBox.style.visibility = 'hidden'
            suggBox.innerHTML = ""
        }  
    }
}
function selected(element){
    let selectData = element.textContent;
    inputBox.value = selectData;
    suggBox.style.visibility = 'hidden'
    icon.onclick();
}
function showSuggestions(list){
    let listData;
    if(!list.length){
        userValue = inputBox.value;
        listData = `<li>${userValue}</li>`;
    }else{
      listData = list.join('');
    }
    suggBox.innerHTML = listData;
}

function play_sound(x){
    var audio = new Audio(x);
    audio.play();
}

//check vietnamese char
var hasVietnamese = function (str){
    return (/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ|è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ|ì|í|ị|ỉ|ĩ|ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ|ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ|ỳ|ý|ỵ|ỷ|ỹ|đ/g.test(str))?1:0;
};

function add_link(s, c){
    let regex = ['.', ',', ')', ';', ':'];
    let special = /[^\w\s]/
    for (let t = 0; t < s.length; t++){
        if (wordList.includes(s[t].toLowerCase())){
            if (s[t].toLowerCase() == inputBox.value)
                content.innerHTML += `<span style='font-weight:bold;color:#660000'>`+s[t]+'</span>'
            else
                content.innerHTML += `<a class='`+c+`' href='/word=`+s[t].toLowerCase()+`&typeOfDict=1'>`+s[t]+'</a>'
            if (!regex.includes(s[t+1]))
                content.innerHTML += `<span class='`+c+`'>`+' '+'</span>'
        }
        else {
            if (special.test(s[t])){
                if ((regex.includes(s[t])) || (s[t][s[t].length-2] == `'`))
                    content.innerHTML += `<span class='`+c+`'>`+s[t]+' '+'</span>'
                else 
                    content.innerHTML += `<span class='`+c+`'>`+s[t]+'</span>'
            }
            else
                if (!regex.includes(s[t+1]))
                    content.innerHTML += `<span class='`+c+`'>`+s[t]+' '+'</span>'
                else 
                    content.innerHTML += `<span class='`+c+`'>`+s[t]+'</span>'
        }     
    }
}

function add_link_1(s, c){
    let text = ''
    let regex = ['.', ',', ')', ';', ':'];
    let special = /[^\w\s]/
    for (let t = 0; t < s.length; t++){
        if (wordList.includes(s[t].toLowerCase())){
            if (s[t].toLowerCase() == inputBox.value)
                text += `<span class='`+c+`' style='font-weight:bold;color:#660000'>`+s[t]+'</span>'
            else
                text += `<a class='`+c+`' href='/word=`+s[t].toLowerCase()+`&typeOfDict=1'>`+s[t]+'</a>'
            if (!regex.includes(s[t+1]))
                text += `<span class='`+c+`'>`+' '+`</span>`
        }
        else {
            if (special.test(s[t])){
                if ((regex.includes(s[t])) || (s[t][s[t].length-2] == `'`))
                    text += `<span class='`+c+`'>`+s[t]+' '+'</span>'
                else 
                    text += `<span class='`+c+`'>`+s[t]+'</span>'
            }
            else
                if (!regex.includes(s[t+1]))
                    text += `<span class='`+c+`'>`+s[t]+' '+'</span>'
                else 
                    text += `<span class='`+c+`'>`+s[t]+'</span>'
        }     
    }
    return text
}
