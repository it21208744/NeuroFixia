# sentiment_preprocessing.py
import re
import string
import pandas as pd
from nltk.stem import PorterStemmer
from translate import Translator
from langdetect import detect, DetectorFactory
import numpy as np

# Set a seed for consistent language detection
DetectorFactory.seed = 0

# Initialize stemmer
ps = PorterStemmer()

def translate_to_english(text):
    """
    Translates Sinhala and Tamil text to English.
    """
    try:
        # Detect the language of the input text
        try:
            lang = detect(text)
        except:
            lang = 'si'  # Fallback to Sinhala
        
        # Translate based on the detected language
        if lang == 'si':  # Sinhala
            translator = Translator(from_lang="si", to_lang="en")
        elif lang == 'ta':  # Tamil
            translator = Translator(from_lang="ta", to_lang="en")
        else:  # If the language is not Sinhala or Tamil, assume it's already in English
            return text
        
        translation = translator.translate(text)
        return translation
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original text if translation fails

def remove_punctuations(text):
    for punctuation in string.punctuation:
        text = text.replace(punctuation, '')
    return text

def preprocessing_sentiment(text, sw):
    """
    Preprocesses the input text for sentiment analysis.
    """
    # Step 1: Translate Sinhala/Tamil text to English
    text = translate_to_english(text)
    
    # Step 2: Clean the text
    data = pd.DataFrame([text], columns=['Response'])
    data["Response"] = data["Response"].apply(lambda x: " ".join(x.lower() for x in x.split()))
    data["Response"] = data['Response'].apply(lambda x: " ".join(re.sub(r'^https?:\/\/.*[\r\n]*', '', x, flags=re.MULTILINE) for x in x.split()))
    data["Response"] = data["Response"].apply(remove_punctuations)
    data["Response"] = data['Response'].str.replace(r'\d+', '', regex=True)
    data["Response"] = data["Response"].apply(lambda x: " ".join(x for x in x.split() if x not in sw))
    data["Response"] = data["Response"].apply(lambda x: " ".join(ps.stem(x) for x in x.split()))
    return data["Response"].iloc[0]

def vectorizer(ds, vocabulary):
    """
    Converts text data into a vectorized format.
    """
    vectorized_lst = []
    
    for sentence in ds:
        sentence_lst = np.zeros(len(vocabulary))
        
        for i in range(len(vocabulary)):
            if vocabulary[i] in sentence.split():
                sentence_lst[i] = 1
                
        vectorized_lst.append(sentence_lst)
        
    vectorized_lst_new = np.asarray(vectorized_lst, dtype=np.float32)
    
    return vectorized_lst_new