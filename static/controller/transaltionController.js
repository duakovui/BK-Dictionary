const switch_lang = document.getElementById("switch-button")
const input = document.getElementById("input")
const output = document.getElementById("output")
const translate = document.getElementById("translate")

switch_lang.onclick = () => {
    const lang1 = document.getElementById("lang1")
    const lang2 = document.getElementById("lang2")
    let tmp = lang1.innerText;
    lang1.innerText = lang2.innerText;
    lang2.innerText = tmp;
}
/*
async function trans_to_eng(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/NlpHUST/t5-vi-en-small",
        {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

async function trans_to_vi(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/NlpHUST/t5-en-vi-small",
        {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

translate.onclick = () => {
    if (document.getElementById("lang1").innerText == 'English'){
        trans_to_vi({"inputs": input.value}).then((response) => {
            output.innerText = response[0].generated_text;
        });
    }
    else {
        trans_to_eng({"inputs": input.value}).then((response) => {
            output.innerText = response[0].generated_text;
        });
    }

}
*/
translate.onclick = () => {
    const rq = new XMLHttpRequest();
    rq.open('POST', '/translate', true)
    rq.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    rq.responseType = "text"
    rq.onload = function () {
        console.log(rq.response)
        output.innerText = rq.response
    }
    var d = JSON.stringify({ 'sentence': input.value, 'srcLang': document.getElementById("lang1").innerText });
    rq.send(d); 
}




