import React, { useContext, useEffect, useRef, useState } from "react";
import { LayerContext } from "../Providers/LayersProvider";
import { transform } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { Cluster } from "ol/source";
import VectorLayer from "ol/layer/Vector";
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
  const apiKey = "a94b9f53a96e630eed19d77f3c475048";
  const city = "Cairo";
  const [searchQuery, setSearchQuery] = useState("");
  const [City, setCity] = useState([]);
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

  const [featureCities, setFeatureCities] = useState([]);

  async function weatherdata(lo, la) {
    const data = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${la}&lon=${lo}&appid=${apiKey}`
    );
    const cityData = await data.json();
    console.log(cityData);
    const long = cityData.coord.lon;
    const lat = cityData.coord.lat;
    const coordPt = [long, lat];
    const projectCoord = transform(coordPt, "EPSG:3857", "EPSG:4326");
    const feature = new Feature({
      geometry: new Point(projectCoord),
    });
    console.log(feature);
    feature.setProperties({
      cityName: cityData.name,
      weather: cityData.weather[0].main,
      description: cityData.weather[0].description,
      maxTemp: cityData.main.temp_max,
      minTemp: cityData.main.temp_min,
    });
    setFeatureCities([...featureCities, feature]);
  }
  useEffect(() => {
    const vectorSource = new VectorSource({
      features: featureCities,
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const cityName = feature.get("cityName");
        const weather = feature.get("weather");
        const description = feature.get("description");
        const maxTemp = feature.get("maxTemp");
        const minTemp = feature.get("minTemp");
        return new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: "red" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
          text: new Text({
            text: cityName + "\n" + weather,
            fill: new Fill({ color: "black" }),
            stroke: new Stroke({ color: "white", width: 2 }),
            offsetY: -20,
          }),
        });
      },
    });
    if (mapObject && vectorLayer) {
      mapObject.addLayer(vectorLayer);
    }
  }, [featureCities]);

  // featureCities.push(feature);
  // console.log(featureCities);
  // setFeatureCities([feature]);
  return (
    <>
      <div>
        <label htmlFor="search" key={city}>
          Search{" "}
        </label>
        <input
          id="search"
          style={{ margin: "5px" }}
          onInput={(e) => setSearchQuery(e.target.value)}
        ></input>
        {City.map((c) => {
          return (
            <div
              style={{ cursor: "pointer" }}
              onClick={() => moveMap(c.lon, c.lat) & weatherdata(c.lon, c.lat)}
            >
              {c.display_name}
            </div>
          );
        })}
      </div>
      <div>
        <div>
          <label htmlFor="OSM">
            {osmLayerObject ? osmLayerObject.get("layerName") : null}
          </label>
          <input
            id="OSM"
            type="radio"
            name="layers"
            defaultChecked={true}
            onChange={(e) => {
              console.log(e.target.id);
              switchLayers(e.target.id);
            }}
          />
        </div>
        <div>
          <label htmlFor="DARK">{darkLayerObject?.get("layerName")}</label>
          <input
            id="DARK"
            type="radio"
            name="layers"
            onChange={(e) => {
              console.log(e.target.id);
              switchLayers(e.target.id);
            }}
          />
        </div>
      </div>
      <div style={{ width: "80vw", height: "500px" }} ref={mapDiv}></div>
    </>
  );
}
