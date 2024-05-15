import React, { useContext, useEffect, useRef, useState } from "react";
import { LayerContext } from "../Providers/LayersProvider";
import { transform } from "ol/proj";
import { Overlay } from "ol";
// import { Feature } from "ol";
// import { Point } from "ol/geom";
// import VectorSource from "ol/source/Vector";
// import { Cluster } from "ol/source";
// import VectorLayer from "ol/layer/Vector";
import "./MapViewer.css";
import process from "process";

export default function MapViewer() {
  const { mapObject, osmLayerObject, darkLayerObject } =
    useContext(LayerContext);
  const mapDiv = useRef();
  useEffect(() => {
    if (mapObject) {
      mapObject.setTarget(mapDiv.current);
    }
    if (osmLayerObject && mapObject) {
      mapObject.addLayer(osmLayerObject);
    }
    if (darkLayerObject && mapObject) {
      mapObject.addLayer(darkLayerObject);
    }
  }, [mapObject, osmLayerObject, darkLayerObject]);

  const switchLayers = (nameOfLayer) => {
    [osmLayerObject, darkLayerObject].forEach((layer) => {
      layer.setVisible(false);
      const name = layer.get("layerName");
      if (name === nameOfLayer) {
        layer.setVisible(true);
      }
    });
  };
  const apiKey = process.env.apiKey;
  const city = "Cairo";
  const [searchQuery, setSearchQuery] = useState("");
  const [City, setCity] = useState([]);
  const [weather, setWeather] = useState();
  const popRef = useRef();
  // const [clusterss, setClustered] = useState();
  // const [featureCities, setFeatureCities] = useState([]);

  // const fun = async function weatherdata() {
  //   const data = await fetch(
  //     `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  //   );
  //   const featureCities = [];
  //   const cityData = await data.json();
  //   console.log(cityData);
  //   const long = cityData.coord.lon;
  //   const lat = cityData.coord.lat;
  //   const coordPt = [long, lat];
  //   const projectCoord = transform(coordPt, "EPSG:3857", "EPSG:4326");
  //   const feature = new Feature({
  //     geometry: new Point(projectCoord),
  //   });
  //   featureCities.push(feature);
  //   // console.log(featureCities);
  //   setFeatureCities([feature]);
  // };
  // useEffect(() => {
  //   fun();
  // }, []);
  // useEffect(() => {
  //   const source = new VectorSource({ features: featureCities });
  //   const clusterSource = new Cluster({
  //     source,
  //     minDistance: 10,
  //   });
  //   const clusterLayer = new VectorLayer({
  //     source: clusterSource,
  //     // style: () => {},
  //   });

  //   setClustered(clusterLayer);
  //   console.log(mapDiv.current);
  //   // mapDiv.current.addLayer(clusterss);
  //   // mapDiv.current.addLayer(clusterLayer);
  // }, [featureCities]);
  // mapObject.current.addLayer(clusterLayer);

  useEffect(() => {
    const key = setTimeout(() => {
      const getPlaceCoord = async () => {
        await fetch(
          `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json`
        )
          .then((r) => r.json())
          .then((d) => (console.log("DDD", d), setCity(d)));
      };
      getPlaceCoord();
    }, 1200);
    return () => clearTimeout(key);
  }, [searchQuery]);

  const moveMap = (lon, lat) => {
    const projectedCoord = transform(
      [parseFloat(lon), parseFloat(lat)],
      "EPSG:4326",
      "EPSG:3857"
    );

    console.log("Location", lon, lat);
    mapObject.getView().animate({ zoom: 7 }, { center: projectedCoord });
  };

  // const [featureCities, setFeatureCities] = useState([]);
  async function weatherdata(lo, la) {
    const data = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${la}&lon=${lo}&appid=${apiKey}`
    )
      .then((r) => r.json())
      .then((data) => setWeather(data));
    // const cityData = await data.json();
    // console.log(cityData);
    // const long = cityData.coord.lon;
    // const lat = cityData.coord.lat;
    // const coordPt = [long, lat];
    // const projectCoord = transform(coordPt, "EPSG:3857", "EPSG:4326");
    // const feature = new Feature({
    //   geometry: new Point(projectCoord),
    // });
    // console.log(feature);
    // console.log(featureCities);
  }
  useEffect(() => {
    if (mapObject) {
      mapObject.on("click", () => {
        setWeather(null);
      });
    }
  }, [mapObject]);

  const popupPosition = () => {
    const pop = new Overlay({
      element: popRef.current,
      positioning: "bottom-left",
      position: null,
    });
    return pop;
  };

  useEffect(() => {
    const pop = popupPosition();
    if (weather && mapObject) {
      const lon = weather.coord.lon;
      const lat = weather.coord.lat;
      const transformedCoord = transform([lon, lat], "EPSG:4326", "EPSG:3857");
      mapObject.addOverlay(pop);
      if (popRef.current) {
        const content = createPopupContent(weather);
        pop.setPosition(transformedCoord);
        popRef.current.innerHTML = content;
      }
    } else {
      if (popRef.current) {
        popRef.current.innerHTML = "";
        pop.setPosition(null);
      }
    }
  }, [weather, mapObject]);
  const createPopupContent = (weather) => {
    console.log(weather);
    const name = weather.name;
    const weathers = weather.weather[0].main;
    const temp_max = weather.main.temp_max;
    const temp_min = weather.main.temp_min;
    const hum = weather.main.humidity;
    let image;
    switch (weathers) {
      case "Clear":
        image = "https://www.openweathermap.org/img/wn/01d.png";
        break;
      case "Clouds":
        image = "https://www.openweathermap.org/img/wn/03d.png";
        break;
      case "Rain":
        image = "https://www.openweathermap.org/img/wn/10d.png";
        break;
      default:
        image = "https://www.openweathermap.org/img/wn/01d.png";
        break;
    }
    const content = `
    <div class="bg-gray-200 border-l-2 border-gray-400 pl-4 mt-4 mr-2 flex items-center">
    <img src="${image}" alt="Weather" class="h-8 w-8 mr-2">
    <div>
    <h5 class="font-semibold text-black">${name}</h5>
    <p class="font-normal text-sm text-black">
      Min Temperature: ${temp_min}&deg;C<br/>
      Max Temperature: ${temp_max}&deg;C<br/>
      Humidity: ${hum}
    </p>
    </div>
  </div>`;
    return content;
  };
  // useEffect(() => {
  //   const vectorSource = new VectorSource({
  //     features: featureCities,
  //   });
  //   const vectorLayer = new VectorLayer({
  //     source: vectorSource,
  //     style: (feature) => {
  //       const cityName = feature.get("name");
  //       const weather = feature.get("weather");
  //       const description = weather.get("description");
  //       const temp = feature.get("main");
  //       const maxTemp = temp.get("temp_max");
  //       const minTemp = temp.get("temp_min");
  //       });
  //     },
  //   });
  //   if (mapObject && vectorLayer) {
  //     mapObject.addLayer(vectorLayer);
  //   }
  // }, [featureCities]);

  // featureCities.push(feature);
  // console.log(featureCities);
  // setFeatureCities([feature]);
  return (
    <>
      <div className="flex items-center mb-4">
        <label htmlFor="search" className="mr-2">
          Search
        </label>
        <input
          id="search"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-md focus:outline-none focus:border-blue-500"
          onInput={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
      </div>
      <div className="max-h-40 overflow-y-auto p-4 rounded-md shadow-md">
        {City.map((c) => (
          <div
            key={c.display_name}
            className="cursor-pointer hover:bg-gray-300 rounded-md p-2"
            onClick={() => {
              moveMap(c.lon, c.lat);
              weatherdata(c.lon, c.lat);
            }}
          >
            {c.display_name}
          </div>
        ))}
      </div>
      <div ref={popRef}></div>
      <div className="absolute bottom-0 right-0 mr-8 mb-8">
        <div className="flex items-center mb-4">
          <button
            id="OSM"
            type="radio"
            name="layers"
            defaultChecked={true}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            onClick={(e) => {
              switchLayers(e.target.id);
            }}
          >
            OSM
          </button>
        </div>
        <div className="flex items-center">
          <button
            id="DARK"
            type="radio"
            name="layers"
            className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            onClick={(e) => {
              switchLayers(e.target.id);
            }}
          >
            DARK
          </button>
        </div>
      </div>
      <div className="w-full h-screen" ref={mapDiv}></div>
    </>
  );
}
