from flask import Flask, render_template, request, url_for, redirect
import os, re
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from transformers import pipeline

app = Flask(__name__)

# Tạo pipeline từ mô hình đã lưu
en_vi = pipeline(task="text2text-generation", model="./en_vi_model")
vi_en = pipeline(task="text2text-generation", model="./vi_en_model")

uri = 'mongodb://localhost:27017'
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# get the collections
mydb = client["dictionary"]
eng = mydb["dictionary_eng"]
vi = mydb["dictionary_vi"]

# get wordList
f = open("static\english.txt", "r")
listWord = f.read().split("\n")
f.close()

@app.route("/dictionary")
def dictionary():
    return render_template("dictionary.html", word = '', typeOfDict = '')

@app.route("/word=<word>&typeOfDict=<typeOfDict>")
def find_word(word, typeOfDict):
    return render_template("dictionary.html", word = word, typeOfDict = typeOfDict)

@app.route("/translation")
def translation():
    return render_template("translation.html")

@app.route("/add_word")
def add_word():
    return render_template("add_word.html")

@app.route('/process_data', methods=['POST'])
def process_data():
    data = request.get_json()
    my_variable = data['myVariable']
    typeOfDict = data['type']

    word = my_variable["english"]
    if word not in listWord:
        listWord.append(word)
        f = open("static\english.txt", "a")
        f.write(f"\n{word}")
        f.close()
      
    if typeOfDict == "English-Vietnamese":
        vi.insert_one(my_variable)
    else:
        eng.insert_one(my_variable)

    return redirect(url_for("dictionary"))

@app.route("/load_data", methods = ['POST'])
def load_data():
    data = request.get_json()
    my_variable = data['myVariable']
    myquery = { "english": my_variable }
    if data['typeOfDict'] == '0':
        mydoc = vi.find_one(myquery, { "_id": 0})
    else:
        mydoc = eng.find_one(myquery, { "_id": 0})
    print(mydoc)

    return mydoc

@app.route("/translate", methods = ['POST'])
def translate():
    data = request.get_json()
    # Sử dụng split để chia đoạn văn thành các câu
    sentences = re.split(r'[.!?]', data['sentence'])
    # Loại bỏ các câu rỗng (do có dấu chấm cuối cùng)
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]

    result = ''
    if data['srcLang'] == 'English':
        for i, sentence in enumerate(sentences):
            result = result + en_vi(sentence)[0]['generated_text'] + " "
    else:
        for i, sentence in enumerate(sentences):
            result = result + vi_en(sentence)[0]['generated_text'] + " "

    return result

@app.route("/save_file", methods = ['POST'])
def save_file():
    word = request.form.get('word')
    if request.form.get('us_blank') == 'n':
        us = request.files['us_sound']
        _, us_extension = os.path.splitext(us.filename)
        us.save(os.path.join('static/sound', f'{word}_us{us_extension}'))
    if request.form.get('uk_blank') == 'n':
        uk = request.files['uk_sound']
        _, uk_extension = os.path.splitext(uk.filename)
        uk.save(os.path.join('static/sound', f'{word}_uk{uk_extension}'))
        
    return redirect(url_for("dictionary"))

@app.route("/")
def home():
    return redirect(url_for("dictionary"))

if __name__ == "__main__":
    app.run()
