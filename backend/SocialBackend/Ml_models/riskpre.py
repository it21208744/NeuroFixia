# riskpre.py
from translate import Translator
from langdetect import detect, DetectorFactory
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Set a seed for consistent language detection
DetectorFactory.seed = 0

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

def preprocessing_risk(df):
    """
    Preprocesses the input DataFrame for risk prediction.
    """
    # First, translate non-English text to English
    df = df.applymap(lambda x: translate_to_english(str(x)) if isinstance(x, str) else x)

    # Ensure all values are strings and normalized to lowercase
    df = df.applymap(lambda x: str(x).strip().lower() if isinstance(x, str) else x)

    # Convert "yes" to 1 and "no" to 0
    # df = df.replace({"yes": 0, "no": 1})
    df = df.replace({"yes": 0, "no": 1}).infer_objects(copy=False)

    # Check for any unexpected values
    if df.isnull().values.any():
        print("Warning: Missing or unexpected values detected in the input data.")

    # Ensure all columns are treated as integers
    try:
        df = df.astype(int)
    except ValueError as e:
        print(f"Data type conversion error: {e}")

    return df
