import logo from "./logo.svg";
import "./App.css";
import SwipeCards from "./components/Card";

function App() {
  return (
    <div className="justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <SwipeCards />
    </div>
  );
}

export default App;
