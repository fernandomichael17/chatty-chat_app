from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import Tokenizer
import os
from flask_cors import CORS
import pickle

app = Flask(__name__)
CORS(app)  # Menambahkan CORS untuk mengizinkan request dari domain lain

# Initialize global variables
model = None
tokenizer = None
max_len = None

# Download NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

# Fungsi untuk memuat model dan tokenizer
def load_model_and_resources():
    global model, tokenizer, max_len
    
    try:
        # Load model
        model_path = 'models/model_capstone_3.h5'
        model = tf.keras.models.load_model(model_path)
        
        # Load tokenizer
        tokenizer_path = 'models/tokenizer_3.pickle'
        with open(tokenizer_path, 'rb') as handle:
            tokenizer = pickle.load(handle)
        
        # Set max_len manually if not loaded from config
        max_len = 100  # Set this to the appropriate value for your model
        
        print("Model dan resource berhasil dimuat")
        return True
    except Exception as e:
        print(f"Error saat memuat model dan resource: {e}")
        return False

# Fungsi stemming (perlu diimplementasikan)
def stemming(words):
    factory = StemmerFactory()
    stemmer = factory.create_stemmer()
    return [stemmer.stem(word) for word in words]

# Fungsi preprocessing persis seperti yang Anda berikan
def preprocess_sentence(sentence):
    sentence = re.sub(r"(?:\@|https?\://)\S+", "", sentence)
    sentence = re.sub(r"http\S+", "", sentence)
    sentence = re.sub(r"<[^>]+>", "", sentence, flags=re.IGNORECASE)
    sentence = re.sub('\n', '', sentence)
    sentence = re.sub('RT', '', sentence)
    sentence = re.sub("[^a-zA-Z^']", " ", sentence)
    sentence = re.sub(" {2,}", " ", sentence)
    sentence = sentence.strip()
    sentence = re.sub(r'\s+', ' ', sentence)
    sentence = sentence.lower()
    return sentence

# Remove slang words
def removeSlang(data):
    # Assuming slang_dict is not available, return the data as is
    return data

def removeStopWords(data):
    stop_words = set(stopwords.words('indonesian'))
    words = data.split()  # Split string into list of words
    filtered_words = [word for word in words if word not in stop_words]
    return ' '.join(filtered_words)  # Join words back into string

def predict_sentence_class(sentence):
    processed_sentence = preprocess_sentence(sentence)
    tokenized_sentence = nltk.word_tokenize(processed_sentence)
    stemmed_sentence = ' '.join(stemming(tokenized_sentence))
    rmvSlang_sentence = removeSlang(stemmed_sentence)
    rmvStopWords_sentence = removeStopWords(rmvSlang_sentence)
    sequence = tokenizer.texts_to_sequences([rmvStopWords_sentence])
    padded_sequence = pad_sequences(sequence, maxlen=max_len, padding='post')
    prediction = model.predict(padded_sequence)[0][0]
    class_label = "badword" if prediction >= 0.982 else "goodword"
    return class_label, prediction

# Endpoint untuk memeriksa apakah teks mengandung kata kasar
@app.route('/check', methods=['POST'])
def check_profanity():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Teks tidak ditemukan dalam request'}), 400
        
        text = data['text']
        class_label, prediction_prob = predict_sentence_class(text)
        
        return jsonify({
            'text': text,
            'is_profane': class_label == "badword",
            'confidence': float(prediction_prob),
            'class_label': class_label
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint untuk memeriksa status
@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online', 
        'model_loaded': model is not None,
        'tokenizer_loaded': tokenizer is not None,
        'max_len': max_len
    })

if __name__ == '__main__':
    # Muat model dan resource saat aplikasi dimulai
    load_model_and_resources()
    
    # Jalankan server pada port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)