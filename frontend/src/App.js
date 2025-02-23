import logo from "./logo.svg";
import "./App.css";
import SwipeCards from "./components/Card";
import StaticSwipeCards from "./components/Timeline";


function App() {
  return (
    <div className="justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <StaticSwipeCards />
    </div>
  );
}

export default App;
