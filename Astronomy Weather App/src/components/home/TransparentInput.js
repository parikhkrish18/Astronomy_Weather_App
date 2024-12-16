import React from 'react';
import './Input.css';


// TransparentInput component to display a transparent input field
const TransparentInput = ({ value, onSubmit }) => {
  // Use a local state to handle input changes
  const [inputValue, setInputValue] = React.useState(value);

  // Update local state when input changes
  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  // Call the passed onSubmit function with the current value
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(inputValue);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className="input"
        placeholder="Enter city..."
      />
    </form>
  );
};

export default TransparentInput;
