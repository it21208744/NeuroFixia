/*
 * Questionnaire text. Bug fix: the Tamil version asked 10 *different* questions from the English
 * and Sinhala versions (e.g. Tamil Q1 was about eye contact, English Q1 about pointing), so Tamil
 * answers were fed to the model in the wrong slots. All three languages now ask the same items.
 */
export const LANGS = {
  english: { label: "English", speech: "en-US" },
  sinhala: { label: "සිංහල (Sinhala)", speech: "si-LK" },
  tamil: { label: "தமிழ் (Tamil)", speech: "ta-LK" },
};

const T = {
  english: {
    title: "Social skills questionnaire",
    intro:
      "Answer based on how your child usually behaves. Questions 9 and 10 can be typed or spoken.",
    q1: "Does your child point to indicate that they want something (e.g. a toy that is out of reach)?",
    q2: "If you or someone else in the family is visibly upset, does your child show signs of wanting to comfort them (e.g. stroking hair, hugging)?",
    q3: "Does your child let you know when they are hungry, thirsty, or want something specific?",
    q4: "Can your child understand simple instructions, such as 'Give the book to Amma' or 'Bring your slippers'?",
    q5: "Does your child follow where you are looking?",
    q6: "Does your child like to play with other children?",
    q7: "Does your child behave well in crowded places like markets, bus stands, or festivals?",
    q8: "Does your child use simple gestures (e.g. waving goodbye)?",
    q9: "Describe in detail how your child reacts when you call their name.",
    q10: "How does your child make eye contact during conversations?",
    yes: "Yes",
    no: "No",
    speak: "Speak",
    listening: "Listening…",
    submit: "Submit",
    waiting: "Analysing answers…",
    risk: "Your child shows some social-communication difficulties related to autism. Please check the improvement activity and consider consulting a professional.",
    noRisk: "No social-skills risk was detected for your child.",
    placeholder: "Type the answer here, or press Speak",
  },
  sinhala: {
    title: "සමාජ කුසලතා ප්‍රශ්නාවලිය",
    intro:
      "ඔබේ දරුවා සාමාන්‍යයෙන් හැසිරෙන ආකාරය අනුව පිළිතුරු දෙන්න. 9 සහ 10 ප්‍රශ්න ටයිප් කිරීමට හෝ කථා කිරීමට හැක.",
    q1: "ඔබේ දරුවා යමක් අවශ්‍ය බව පෙන්වීමට ඒ දෙසට අත දිගු කරනවාද? (උදා: ළඟා විය නොහැකි සෙල්ලම් බඩුවක්)",
    q2: "ඔබ හෝ පවුලේ වෙනත් අයෙකු කලබල වී හෝ දුකට පත්වී ඇත්නම්, ඔබේ දරුවා ඔවුන්ව සනසාලීමට කැමති බවට සලකුණු පෙන්වනවාද?",
    q3: "ඔබේ දරුවා ඔහුට/ඇයට බඩගිනි, පිපාසය, හෝ නිශ්චිත යමක් අවශ්‍ය වූ විට ඔබට දන්වනවාද?",
    q4: "'අම්මාට පොත දෙන්න' හෝ 'ඔබේ සෙරෙප්පු රැගෙන එන්න' වැනි සරල උපදෙස් ඔබේ දරුවාට තේරුම් ගත හැකිද?",
    q5: "ඔබේ දරුවා ඔබ බලන දෙස අවධානය යොමු කරනවාද?",
    q6: "ඔබේ දරුවා අනෙක් දරුවන් සමඟ එක්වී සෙල්ලම් කිරීමට කැමතිද?",
    q7: "වෙළඳපොළවල්, බස් නැවතුම්පොළවල් හෝ උත්සව වැනි ජනාකීර්ණ ස්ථානවල ඔබේ දරුවා හොඳින් හැසිරෙනවාද?",
    q8: "ඔබේ දරුවා සරල අභිනයන් භාවිතා කරනවාද? (උදා: අත වනමින් සමුගැනීම)",
    q9: "ඔබ ඔබේ දරුවාගේ නම අමතන විට ඔහු/ඇය ප්‍රතිචාර දක්වන ආකාරය විස්තර කරන්න.",
    q10: "සංවාද අතරතුර ඔබේ දරුවා ඇස් සබඳතාව පවත්වා ගන්නේ කෙසේද?",
    yes: "ඔව්",
    no: "නැත",
    speak: "කථා කරන්න",
    listening: "සවන් දෙමින්…",
    submit: "ඉදිරියට යන්න",
    waiting: "ප්‍රතිඵලය ලබා ගැනීමට රැඳී සිටින්න…",
    risk: "දරුවාට ඔටිසම් රෝගයට සම්බන්ධ සමාජ කුසලතා දුෂ්කරතා තිබේ. වැඩිදියුණු කිරීමේ ක්‍රියාකාරකම් පරීක්ෂා කර වෛද්‍ය උපදෙස් ලබා ගන්න.",
    noRisk: "අවදානමක් හමු නොවීය.",
    placeholder: "පිළිතුර මෙහි ටයිප් කරන්න, නැතහොත් කථා කරන්න ඔබන්න",
  },
  tamil: {
    title: "சமூகத் திறன் கேள்வித்தாள்",
    intro:
      "உங்கள் குழந்தை வழக்கமாக எப்படி நடந்துகொள்கிறது என்பதைப் பொறுத்து பதிலளிக்கவும். 9, 10 கேள்விகளை தட்டச்சு செய்யலாம் அல்லது பேசலாம்.",
    q1: "உங்கள் குழந்தை தனக்கு ஏதாவது வேண்டும் என்பதைக் காட்ட அதை நோக்கி விரலால் சுட்டிக்காட்டுகிறதா? (உ.ம்: எட்டாத இடத்தில் உள்ள பொம்மை)",
    q2: "நீங்களோ குடும்பத்தில் வேறு ஒருவரோ வருத்தமாக இருந்தால், உங்கள் குழந்தை அவர்களை ஆறுதல்படுத்த விரும்பும் அறிகுறிகளைக் காட்டுகிறதா? (உ.ம்: தலைமுடியை வருடுதல், கட்டிப்பிடித்தல்)",
    q3: "பசி, தாகம் அல்லது குறிப்பிட்ட ஏதாவது வேண்டும்போது உங்கள் குழந்தை உங்களுக்குத் தெரியப்படுத்துகிறதா?",
    q4: "'புத்தகத்தை அம்மாவிடம் கொடு' அல்லது 'உன் செருப்பைக் கொண்டு வா' போன்ற எளிய அறிவுறுத்தல்களை உங்கள் குழந்தை புரிந்துகொள்ளுமா?",
    q5: "நீங்கள் பார்க்கும் திசையை உங்கள் குழந்தையும் பின்தொடர்ந்து பார்க்கிறதா?",
    q6: "உங்கள் குழந்தை மற்ற குழந்தைகளுடன் விளையாட விரும்புகிறதா?",
    q7: "சந்தைகள், பேருந்து நிலையங்கள் அல்லது திருவிழாக்கள் போன்ற நெரிசலான இடங்களில் உங்கள் குழந்தை நன்றாக நடந்துகொள்கிறதா?",
    q8: "உங்கள் குழந்தை எளிய சைகைகளைப் பயன்படுத்துகிறதா? (உ.ம்: கை அசைத்து விடைபெறுதல்)",
    q9: "உங்கள் குழந்தையின் பெயரைச் சொல்லி அழைக்கும்போது அது எவ்வாறு பதிலளிக்கிறது என்பதை விரிவாக விவரிக்கவும்.",
    q10: "உரையாடல்களின்போது உங்கள் குழந்தை எவ்வாறு கண் தொடர்பு கொள்கிறது?",
    yes: "ஆம்",
    no: "இல்லை",
    speak: "பேசவும்",
    listening: "கேட்கிறது…",
    submit: "சமர்ப்பிக்கவும்",
    waiting: "முடிவுக்காக காத்திருக்கிறது…",
    risk: "உங்கள் குழந்தைக்கு ஆட்டிசத்துடன் தொடர்புடைய சமூகத் திறன் சிரமங்கள் உள்ளன. மேம்பாட்டு செயல்பாடுகளைப் பார்த்து, நிபுணரை அணுகவும்.",
    noRisk: "ஆபத்து கண்டறியப்படவில்லை.",
    placeholder: "பதிலை இங்கே தட்டச்சு செய்யவும் அல்லது பேசவும்",
  },
};

export default T;

export const QUESTION_SHORT = {
  q1: "Pointing to ask",
  q2: "Comforting others",
  q3: "Communicating needs",
  q4: "Following instructions",
  q5: "Joint attention",
  q6: "Playing with peers",
  q7: "Crowded places",
  q8: "Using gestures",
  q9: "Response to name",
  q10: "Eye contact",
};
