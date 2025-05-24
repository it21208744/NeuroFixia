import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { LangContext } from "layouts/Social";

import downloadImg from "./images/sback.jpg";

// Voice recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

export default function Questionnaire() {
  const { setValue, lang } = useContext(LangContext); // 👈 Use context to change tabs
  console.log("Language is", lang);
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState("");
  const [q7, setQ7] = useState("");
  const [q8, setQ8] = useState("");
  const [q9, setQ9] = useState("");
  const [q10, setQ10] = useState("");

  const [listening, setListening] = useState(null);
  const [result, setResult] = useState(""); // State to store the risk prediction result
  const [showPopup, setShowPopup] = useState(false); // State to control result popup visibility
  const [isLoading, setIsLoading] = useState(false); // State to track loading state

  //   const { lang } = useParams();
  const [translatedLabels, setTranslatedLabels] = useState({});
  const navigate = useNavigate();

  // Translations
  useEffect(() => {
    const translations = {
      english: {
        title: "Evaluation Form",
        q1: "1. Does your child point to indicate that s/he wants something? (e.g. a toy that is out of reach) ?",
        q2: "2. Does your child like to play with other children?",
        q3: "3. Does your child let you know when he/she is hungry, thirsty, or wants something specfic?",
        q4: "4. Does your child follow where you are looking? ",
        q5: "5. Can your child understand simple instructions given, such as 'Give the book to Amma' or 'Bring your slippers'?",
        q6: "6. If you or someone else in the family is visibly upset, does your child show signs of wanting to comfort them? (e.g. stroking hair, hugging them)?",
        q7: "7. Does your child behave well in crowded places like markets, bus stands, or festivals?",
        q8: "8. Does your child use simple gestures? (e.g. wave goodbye) ",
        q9: "9. Describe in detail how your child reacts when you call their name.",
        q10: "10. How does your child make eye contacts during conversations ?",
        yes: "Yes",
        no: "No",
        speak: "🔊 Use your voice",
        submit: "Submit",
        resultMessage: "Risk Prediction:",
        close: "Close",
        waiting: "Waiting for result...",
      },
      sinhala: {
        title: "ප්‍රශ්නාවලි පෝරමය",
        q1: "1. ඔබේ දරුවා යමක් අවශ්‍ය බව පෙන්වීමට ඒ දෙසට අත දිගු කරනවාද? (උදා: ළඟා විය නොහැකි සෙල්ලම් බඩුවක්)?",
        q2: "2. ඔබේ දරුවා අනෙක් දරුවන් සමඟ එක්වී සෙල්ලම් කිරීමට කැමතිද?",
        q3: "3. ඔබේ දරුවා ඔහුට/ඇයට බඩගිනි, පිපාසය, හෝ නිශ්චිත  යමක් අවශ්‍ය වූ විට  ඔබට දන්වනවාද?",
        q4: "4. ඔබේ දරුවා ඔබ බලන දෙස අවදානය යොමු කරනවාද?",
        q5: "5. 'අම්මාට පොත දෙන්න' හෝ 'ඔබේ සෙරෙප්පු රැගෙන එන්න' වැනි සරල උපදෙස් ඔබේ දරුවාට තේරුම් ගත හැකිද?",
        q6: "6. ඔබ හෝ පවුලේ වෙනත් අයෙකු කලබල වී හෝ දුකට පත්වී ඇත්නම්, ඔබේ දරුවා ඔවුන්ව සනසාලීමට කැමති බවට සලකුණු පෙන්වනවාද?",
        q7: "7. වෙළඳපොළවල්, බස් නැවතුම්පොළවල් හෝ උත්සව වැනි ජනාකීර්ණ ස්ථානවල ඔබේ දරුවා හොඳින් හැසිරෙනවාද?",
        q8: "8. ඔබේ දරුවා සරල අභිනයන් භාවිතා කරනවාද? (උදා: අත වනමින් සමුගැනීම)?",
        q9: "9. ඔබ ඔබේ දරුවාගේ නම අමතන විට ඔහු ප්‍රතිචාර දක්වන ආකාරය විස්තර කරන්න.",
        q10: "10. සංවාද අතරතුර ඔබේ දරුවා ඇස් සබදතාවය පවත්වා ගන්නේ කෙසේද?",
        yes: "ඔව්",
        no: "නැත",
        speak: "🔊 හඬ භාවිතය",
        submit: "ඉදිරියට යන්න",
        resultMessage: "අවදානම් අනාවැකිය:",
        close: "වසන්න",
        waiting: "ප්‍රතිඵලය ලබා ගැනීමට රැඳී සිටින්න...",
      },
      tamil: {
        title: "குழந்தை தனித்துவம் மதிப்பீடு",
        q1: "1. குடும்ப உறுப்பினர்கள் அல்லது பார்வையாளர்களுடனான உரையாடல்கள் அல்லது தொடர்புகளின் போது உங்கள் குழந்தை கண் தொடர்பு கொள்கிறதா?",
        q2: "2. அரைக்கும் இயந்திரங்கள் அல்லது கோவில்/தேவாலய மணி போன்ற பொதுவான வீட்டுச் சத்தங்களுக்கு உங்கள் குழந்தை பயப்படுகிறதா அல்லது கடுமையாக எதிர்வினையாற்றுகிறதா?",
        q3: "3. உங்கள் குழந்தை மற்ற குழந்தைகளுடன் சேர்ந்து விளையாடுவதை விட தனியாக விளையாடுவதை விரும்புகிறதா?",
        q4: "4. டிவி உரையாடல்கள் அல்லது பாடல்கள் போன்ற சூழலுக்கு அப்பாற்பட்ட வார்த்தைகள் அல்லது சொற்றொடர்களை உங்கள் குழந்தை மீண்டும் சொல்கிறாரா?",
        q5: "5. 'புத்தகத்தை அம்மாவிடம் கொடு' அல்லது 'உங்கள் செருப்புகளைக் கொண்டு வாருங்கள்' போன்ற எளிய வழிமுறைகளை உங்கள் குழந்தை புரிந்துகொள்ள முடியுமா?",
        q6: "6. உணவின் போது அல்லது விளையாடும் போது உங்கள் குழந்தை உங்கள் பெயரைச் சொல்லி அழைக்கும் போது அவர் எவ்வாறு பதிலளிப்பார்?",
        q7: "7. சந்தைகள், பேருந்து நிலையங்கள் அல்லது திருவிழாக்கள் போன்ற நெரிசலான இடங்களில் உங்கள் குழந்தை எப்படி நடந்து கொள்கிறது?",
        q8: "8. உங்கள் பிள்ளை பசியாக இருக்கும்போது, ​​தாகமாக இருக்கும்போது அல்லது குறிப்பிட்ட ஒன்றை விரும்பும்போது எப்படி உங்களுக்குத் தெரியப்படுத்துவார்?",
        q9: "9. உங்கள் பிள்ளை பொம்மைகள் அல்லது வீட்டுப் பொருட்கள் போன்ற பொருட்களை வைத்து விளையாடும்போது பொதுவாக என்ன செய்வார்?",
        q10: "10. வீட்டில் புதிய அல்லது அறிமுகமில்லாத ஒன்றை செய்யும்படி கேட்கப்படும் போது உங்கள் குழந்தை எவ்வாறு பதிலளிக்கிறார்?",
        yes: "ஆம்",
        no: "இல்லை",
        speak: "🔊 குரல் பயன்படுத்த",
        submit: "சமர்ப்பிக்கவும்",
        resultMessage: "அபாயம் கணிப்பு:",
        close: "மூடு",
        waiting: "முடிவுக்காக காத்திருக்கிறது...",
      },
    };
    if (translations[lang]) {
      setTranslatedLabels(translations[lang]);
      document.title = translations[lang].title;
    } else {
      console.warn(`Unsupported language code: ${lang}`);
      setTranslatedLabels(translations["english"]); // fallback
      document.title = "Autism Risk Assessment";
    }
  }, [lang]);

  // Speech recognition
  function startListening(field) {
    setListening(field);

    // Set the language based on the selected language
    if (lang === "sinhala") recognition.lang = "si-LK";
    else if (lang === "tamil") recognition.lang = "ta-LK";
    else recognition.lang = "en-US";

    // Try to start recognition and catch errors if recognition has already started
    try {
      recognition.start();
    } catch (error) {
      if (error instanceof DOMException && error.code === DOMException.INVALID_STATE_ERR) {
        console.log("Recording already started.");
        // Optionally, show an alert or message on the UI
        alert("Speech Recognition already started.");
      } else {
        console.error("An error occurred: ", error);
      }
    }
  }

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;

    if (listening === "q6") setQ6(spokenText);
    if (listening === "q7") setQ7(spokenText);
    if (listening === "q8") setQ8(spokenText);
    if (listening === "q9") setQ9(spokenText);
    if (listening === "q10") setQ10(spokenText);

    setListening(null);
  };

  recognition.onspeechend = () => recognition.stop();

  // Submit form
  async function handleSubmit(e) {
    e.preventDefault();

    const newSales = { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 };

    setIsLoading(true); // Set loading state to true

    try {
      // Send data to Express.js for analysis and saving
      const response = await axios.post("http://localhost:8070/Sroute/analyze", newSales);
      const riskPrediction = response.data.risk_prediction;

      // Set the result state with the translated message and show the popup
      if (lang === "sinhala") {
        setResult(
          riskPrediction === 1
            ? "ඔබේ දරුවාට ඔටිසම් රෝගයට සම්බන්ධ සමාජ කුසලතා දුෂ්කරතා තිබේ, වැඩිදියුණු කිරීමේ ක්‍රියාකාරකම් පරීක්ෂා කරන්න"
            : "අවදානමක් නැත"
        );
      } else if (lang === "tamil") {
        setResult(riskPrediction === 1 ? "ஆபத்து கண்டறியப்பட்டது" : "ஆபத்து கண்டறியப்படவில்லை");
      } else {
        setResult(
          riskPrediction === 1
            ? "Your child has social skills difficulties related to autism, Checkout improvement activities"
            : "No Risk Detected"
        );
      }

      setShowPopup(true); // Show the result popup
    } catch (err) {
      alert("Error submitting the form: " + err.message);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  }

  // Close the popup
  const closePopup = () => {
    setShowPopup(false);
    setValue("three");
  };

  // Styles
  const containerStyle = {
    padding: "20px",
    backgroundColor: "#E8EFF4",
    overflow: "hidden",
    boxShadow: "0 2px 20px",
    borderRadius: "$radius",
    transition: "transform 200ms ease-in",
    padding: "20px",
    backdropFilter: "blur(50px)",
    maxWidth: "1000px",
    margin: "0 auto",
    marginTop: "50px",
    flexDirection: "column",
    alignItems: "center",
  };
  const labelStyle = {
    marginBottom: "8px",
    display: "block",
    color: "#1C325B",
    fontWeight: "bold",
  };
  const inputStyle = {
    width: "100%",
    marginBottom: "15px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
    boxSizing: "border-box",
  };
  const buttonStyle = {
    backgroundImage: "linear-gradient(125deg,#1C325B,#4A628A)",
    color: "#fff",
    padding: "12px 40px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    width: "20%",
    marginTop: "15px",
    marginLeft: "auto",
    //display: "block",
    textAlign: "center",
    display: "flex", // Ensure flexbox is used
    justifyContent: "center", // Horizontally center text
    alignItems: "center", // Vertically center text
  };
  const speakButtonStyle = {
    backgroundColor: "transparent",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
    outline: "none",
    boxShadow: "none",
  };

  // Define lastFieldStyle
  const lastFieldStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: "20px",
  };

  // Popup styles
  const popupStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
    textAlign: "center",
  };
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  };

  return (
    <>
      <div
      // style={{
      //   backgroundImage: `url(${downloadImg})`,
      //   backgroundRepeat: "no-repeat",
      //   backgroundSize: "cover",
      //   width: "100vw",
      //   height: "300vh",
      // }}
      >
        <h3 style={{ textAlign: "center", fontWeight: "10px" }}>{translatedLabels.title}</h3>
        <form onSubmit={handleSubmit} style={containerStyle}>
          {[...Array(8).keys()].map((i) => (
            <div key={i} style={{ width: "100%" }}>
              <label style={labelStyle}>{translatedLabels[`q${i + 1}`]}</label>
              <select
                required
                value={eval(`q${i + 1}`)}
                onChange={(e) => eval(`setQ${i + 1}(e.target.value)`)}
                style={inputStyle}
              >
                <option value="">
                  {translatedLabels.yes}/{translatedLabels.no}
                </option>
                <option value={translatedLabels.yes}>{translatedLabels.yes}</option>
                <option value={translatedLabels.no}>{translatedLabels.no}</option>
              </select>
            </div>
          ))}

          {[...Array(2).keys()].map((i) => (
            <div key={i + 8} style={lastFieldStyle}>
              <label style={labelStyle}>{translatedLabels[`q${i + 9}`]}</label>
              <textarea
                required
                value={eval(`q${i + 9}`)}
                onChange={(e) => eval(`setQ${i + 9}(e.target.value)`)}
                style={inputStyle}
                rows="2"
              />
              <button
                type="button"
                onClick={() => startListening(`q${i + 9}`)}
                style={speakButtonStyle}
              >
                {translatedLabels.speak}
              </button>
            </div>
          ))}
          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {translatedLabels.submit}
          </button>
        </form>

        {/* Loading Popup */}
        {isLoading && (
          <>
            <div style={overlayStyle}></div>
            <div style={popupStyle}>
              <h3>{translatedLabels.waiting}</h3>
            </div>
          </>
        )}

        {/* Result Popup */}
        {showPopup && (
          <>
            <div style={overlayStyle} onClick={closePopup}></div>
            <div style={popupStyle}>
              <h3>{translatedLabels.resultMessage}</h3>
              <p>{result}</p>
              <button onClick={closePopup} style={buttonStyle}>
                {translatedLabels.close}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
