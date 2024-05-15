import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { transform } from "ol/proj";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import React, { createContext, useEffect, useState } from "react";

export const LayerContext = createContext();
export default function LayersProvider(props) {
  const [mapObject, setMapObject] = useState();
  const [osmLayerObject, setOsmLayerObject] = useState();
  const [darkLayerObject, setDarkLayerObject] = useState();

  useEffect(() => {
    //create and assigne map
    const map = new Map({});
    const point = [31.221826981474692, 30.057185299358977]; // @zamalek
    const projeectedPoint = transform(point, "EPSG:4326", "EPSG:3857");
    const view = new View({
      center: projeectedPoint,
      zoom: 5,
    });
    map.setView(view);
    setMapObject(map);
    // create and assigne osm layer
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: true,
    });
    osmLayer.set("layerName", "OSM");
    setOsmLayerObject(osmLayer);
    // create and assigne dark layer
    const darkLayer = new TileLayer({
      source: new XYZ({
        url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
      }),
      visible: false,
      layerName: "DARK",
    });
    setDarkLayerObject(darkLayer);
  }, []);
  return (
    <LayerContext.Provider
      value={{ mapObject, osmLayerObject, darkLayerObject }}
    >
      {props.children}
    </LayerContext.Provider>
  );
}
