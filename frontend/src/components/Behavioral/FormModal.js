import { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  justifyContent: "center",
};

export default function FormModal({
  setModalResponses,
  modalOpen,
  setModalOpen,
  handleModalOpen,
  handleModalClose,
  handleNextVideo,
}) {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleNext = () => {
    handleNextVideo(selectedValue);
    setSelectedValue(""); // Reset the selected value
  };

  return (
    <div>
      <Button onClick={handleModalOpen}>Open modal</Button>
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <FormControl>
            <FormLabel id="demo-row-radio-buttons-group-label" justifyContent="center">
              What facial expressions were shown in the video
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={selectedValue}
              onChange={handleChange}
            >
              <FormControlLabel value="Happy" control={<Radio />} label="Happy" />
              <FormControlLabel value="Sad" control={<Radio />} label="Sad" />
              <FormControlLabel value="Angry" control={<Radio />} label="Angry" />
              <FormControlLabel value="Surprised" control={<Radio />} label="Surprised" />
              <FormControlLabel value="Scared" control={<Radio />} label="Scared" />
              <FormControlLabel value="noAnswer" control={<Radio />} label="No answer" />
            </RadioGroup>
            <Stack direction="row" justifyContent="center">
              <Button variant="contained" color="success" onClick={handleNext}>
                Next
              </Button>
            </Stack>
          </FormControl>
        </Box>
      </Modal>
    </div>
  );
}

FormModal.propTypes = {
  setModalResponses: PropTypes.func.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  setModalOpen: PropTypes.func.isRequired,
  handleModalOpen: PropTypes.func.isRequired,
  handleModalClose: PropTypes.func.isRequired,
  handleNextVideo: PropTypes.func.isRequired,
};
