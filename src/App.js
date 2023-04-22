import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

function App() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validatePassword(password)) {
      setSuccess(true);
      setPassword("");
      setError("");
    } else {
      setError("Password must contain minimum of 8 characters, should contain both uppercase and lowercase letter, minimum of 1 numerical digit (0-9), and minimum of 1 special character (!@#$%^&*, etc)");
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <TextField
          required
          id="password"
          label="Password"
          type="password"
          variant="outlined"
          margin="normal"
          fullWidth
          value={password}
          onChange={handleChange}
          error={Boolean(error)}
          helperText={error}
        />
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        message="Success!"
        onClose={handleClose}
      />
    </div>
  );
}

export default App;
