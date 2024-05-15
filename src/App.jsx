import "./App.css";
import LayersProvider from "./Providers/LayersProvider";
import MapViewer from "./Components/MapViewer";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <LayersProvider>
      <MapViewer />
    </LayersProvider>
  );
}

export default App;
