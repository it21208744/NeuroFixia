import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import prettier from "prettier";
import downloadImg from "./images/sback.jpg";
import download from "./images/a.png";
import { LangContext } from "layouts/Social";

export default function InitialQuestion() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  // const [lang, setLang] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [step, setStep] = useState(1); // Track form steps

  const navigate = useNavigate();
  const { setValue, lang, setLang } = useContext(LangContext); // 👈 Use context to change tabs

  function sendData(e) {
    e.preventDefault();

    const newSales = {
      age,
      gender,
      lang,
    };

    axios
      .post("http://localhost:8070/Iroute/add", newSales)
      .then(() => {
        // setAge("");
        // setGender("");
        // setLang("");
        setShowPopup(false); // Close popup after submission
        setValue("two"); // 👈 Switch to Questionnaire tab
        console.log("setLang Value", lang);
      })
      .catch((err) => {
        alert("Error submitting the form: " + err);
      });
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    height: "36px",
    borderWidth: "0 0 2px 0",
    borderColor: "#5543ca",
    fontSize: "18px",
    fontWeight: "400",
    lineHeight: "26px",
  };

  const buttonStyle = {
    display: "inline-block",
    backgroundImage: "linear-gradient(125deg,#1C325B,#4A628A)",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontSize: "16px",
    width: "200px",
    height: "36px",
    border: "none",
    cursor: "pointer",
  };

  const lableStyle = {
    color: "#064497",
  };

  const cardstyle = {
    overflow: "hidden",
    boxShadow: "0 2px 20px",
    borderRadius: "10px",
    transition: "transform 200ms ease-in",
    padding: "20px",
    backdropFilter: "blur(5px)",
    background: "linear-gradient(rgba(255, 255, 255, 0.7),rgba(255, 255, 255, 0.3))",
    width: "400px",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
  };

  const imageStyle = {
    maxWidth: "100%",
    height: "auto",
    border: "none",
  };

  const labels = {
    sinhala: {
      age: "වයස",
      gender: "ස්ත්‍රී පුරුෂ භාවය",
      male: "පුරුෂ",
      female: "ස්ත්‍රී",
      title: "සිංහල",
    },
    english: { age: "Age", gender: "Gender", male: "Male", female: "Female", title: "English" },
    tamil: { age: "வயது", gender: "பாலினம்", male: "ஆண்", female: "பெண்", title: "தமிழ்" },
  };

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${downloadImg})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          width: "100vw",
          height: "100vh",
        }}
      >
        <div
          style={{
            color: "#1C325B",
            fontWeight: "1000",
            fontSize: "70px",
            fontStyle: "oblique",
            marginLeft: "350px",
          }}
        >
          Social Skills Observation
        </div>
        <div>
          <h3
            style={{
              color: "#1C325B",
              fontWeight: "20",
              fontSize: "20px",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            {
              "Answer this brief questionnaire to better understand your child's social and communication "
            }
            <br />
            {"development, tailored to provide helpful insights and support."}
          </h3>
        </div>

        <div style={{ textAlign: "center", marginTop: "60px" }}>
          <button onClick={() => setShowPopup(true)} style={buttonStyle}>
            Start here
          </button>
        </div>
        <div style={containerStyle}>
          <img style={imageStyle} src={download} alt="Description of the image" />
        </div>

        {showPopup && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div style={cardstyle}>
              {step === 1 ? (
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ color: "#064497" }}>Select Language</h3>
                  <div
                    onChange={(e) => {
                      setLang(e.target.value);
                      setStep(2);
                    }}
                  >
                    <label>
                      <input type="radio" value="sinhala" name="language" /> Sinhala
                    </label>
                    <br />
                    <label>
                      <input type="radio" value="english" name="language" /> English
                    </label>
                    <br />
                    <label>
                      <input type="radio" value="tamil" name="language" /> Tamil
                    </label>
                  </div>
                </div>
              ) : (
                <form onSubmit={sendData}>
                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={() => setShowPopup(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#064497",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      ✖
                    </button>
                  </div>
                  <h3 style={{ textAlign: "center", color: "#064497" }}>{labels[lang].title}</h3>
                  <div className="form-group">
                    <label style={lableStyle}>{labels[lang].age}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={labels[lang].age}
                      style={inputStyle}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={lableStyle}>{labels[lang].gender}</label>
                    <select
                      className="form-control"
                      style={inputStyle}
                      onChange={(e) => setGender(e.target.value)}
                      required
                    >
                      <option value="">{labels[lang].gender}</option>
                      <option value="male">{labels[lang].male}</option>
                      <option value="female">{labels[lang].female}</option>
                    </select>
                  </div>
                  <div style={{ textAlign: "center", marginTop: "15px" }}>
                    <button type="submit" className="btn btn-primary" style={buttonStyle}>
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
