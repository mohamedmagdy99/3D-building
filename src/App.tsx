import React from "react";
import "./App.css";
import Building from "./components/Building";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Building />
      </header>
    </div>
  );
};

export default App;
