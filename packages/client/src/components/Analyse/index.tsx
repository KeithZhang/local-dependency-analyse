import React from "react";
import Graphin, { Utils } from "@antv/graphin";
import { Toolbar } from "@antv/graphin-components";
import LayoutSelector from "./layout-selector";

import "@antv/graphin/dist/index.css";
import "@antv/graphin-components/dist/index.css";
import styles from "./index.module.scss";

import data1 from './data.json';


console.log('data1...', data1)
const data = Utils.mock(10)
  .random(0.6)
  .graphin();

  console.log('data...', data)

const App = () => {
  const [layout, changeLayout] = React.useState({ name: "radial", options: {} });
  return (
    <div className={styles.app}>
      <Graphin data={data1} layout={layout} options={{
        zoom: 100,
        keyShapeZoom: 2
      }}>
        <LayoutSelector
          value={layout.name}
          onChange={value => {
            changeLayout({
              ...layout,
              name: value
            });
          }}
        />
        <Toolbar />
      </Graphin>
    </div>
  );
};

export default App
