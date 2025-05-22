import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Modal } from "react-bootstrap";
//import ReactToPrint from "react-to-print";
import * as XLSX from "xlsx"; // Import XLSX library
import downloadImg from "./images/sback.jpg";

export default function AllSales() {
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [Coffees, setCoffees] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  function getCoffees() {
    axios
      .get("http://localhost:8070/Sroute/")
      .then((res) => {
        setCoffees(res.data);
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  const handleDeleteClick = (_id) => {
    setSelectedId(_id);
    setShowModal(true);
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:8070/Sroute/delete/${selectedId}`)
      .then((res) => {
        getCoffees();
        setCoffees(Coffees.filter((item) => item._id !== selectedId));
        setShowModal(false);
      })
      .catch((err) => {
        alert(err.message);
        setShowModal(false);
      });
  };

  const SetToLocalStorage = (
    id,
    q1,
    q2,
    q3,
    q4,
    q5,
    q6,
    q7,
    q8,
    q9,
    q10,
    risk_prediction // Add this field
  ) => {
    localStorage.setItem("id", id);
    localStorage.setItem("q1", q1);
    localStorage.setItem("q2", q2);
    localStorage.setItem("q3", q3);
    localStorage.setItem("q4", q4);
    localStorage.setItem("q5", q5);
    localStorage.setItem("q6", q6);
    localStorage.setItem("q7", q7);
    localStorage.setItem("q8", q8);
    localStorage.setItem("q9", q9);
    localStorage.setItem("q10", q10);
    localStorage.setItem("risk_prediction", risk_prediction); // Save prediction result
  };

  useEffect(() => {
    const filteredResults = Coffees.filter((item) => {
      return item._id.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredData(filteredResults);
  }, [Coffees, searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    getCoffees();
  }, []);

  const componentRef = useRef(null);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Data");
    XLSX.writeFile(workbook, "SalesData.xlsx");
  };

  const cardStyle = {
    overflow: "hidden",
    boxShadow: "0 2px 20px",
    borderRadius: "$radius",
    transition: "transform 200ms ease-in",
    padding: "20px",
    backdropFilter: "blur(50px)",
    background: "linear-gradient(rgba(255, 255, 255, 0.7),rgba(255, 255, 255, 0.3))",
    marginLeft: "60px",
    marginRight: "60px",
    marginBottom: "20px",
  };

  const searchStyle = {
    borderRadius: "25px",
    borderColor: "#5543ca",
    border: "2px solid #3c341f",
    padding: "20px",
    width: "300px",
    height: "15px",
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
        <div className="d-flex flex-direction-column justify-content-between m-2">
          <h3 style={{ color: "#1C325B", marginLeft: "100px" }}>Response submitted</h3>

          <div className="mb-3">
            <Button
              variant="success"
              onClick={exportToExcel}
              style={{
                marginRight: "150px",
                backgroundImage: "linear-gradient(125deg,#1C325B,#4A628A)",
              }}
            >
              Export to Excel
            </Button>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          {filteredData.map((item, index) => (
            <div className="card" key={item._id} style={cardStyle}>
              <div className="card-body">
                <h5 className="card-title">Response {index + 1}</h5>
                <p className="card-text">
                  <strong>1. </strong> {item.q1}
                  <br />
                  <strong>2. </strong> {item.q2}
                  <br />
                  <strong>3. </strong> {item.q3}
                  <br />
                  <strong>4. </strong> {item.q4}
                  <br />
                  <strong>5. </strong> {item.q5}
                  <br />
                  <strong>6. </strong> {item.q6}
                  <br />
                  <strong>7. </strong> {item.q7}
                  <br />
                  <strong>8. </strong> {item.q8}
                  <br />
                  <strong>9. </strong> {item.q9}
                  <br />
                  <strong>10. </strong> {item.q10}
                  <br />
                  <strong>Prediction: </strong> {item.risk_prediction} {/* Add this line */}
                </p>
                <div className="d-flex justify-content-between">
                  <a href="/update">
                    <Button
                      variant="success"
                      onClick={() =>
                        SetToLocalStorage(
                          item._id,
                          item.q1,
                          item.q2,
                          item.q3,
                          item.q4,
                          item.q5,
                          item.q6,
                          item.q7,
                          item.q8,
                          item.q9,
                          item.q10,
                          item.risk_prediction // Pass prediction result
                        )
                      }
                    >
                      Edit
                    </Button>
                  </a>
                  <Button variant="danger" onClick={() => handleDeleteClick(item._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
