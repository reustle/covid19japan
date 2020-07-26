import React, { useEffect, useState } from "react";
import { string } from "prop-types";
import gradient from "./linearGradient";
import Loader from "../Loader";

const Kpi = ({ id, label, value, diff, caption, chartName, percent }) => {
  const [graph, setGraph] = useState(null);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    if (chartName) {
      let svgURL = `https://data.covid19japan.com/charts/${chartName}`;
      fetch(svgURL).then((response) => {
        if (response.status === 200) {
          response.text().then((data) => {
            setisLoading(false);
            setGraph(data);
          });
        }
      });
    }
  }, [chartName]);
  if (!value) return null;
  return (
    <div className="kpi-box" id={`kpi-${id}`}>
      <div className="label">{label}</div>
      <div className="value">{value} </div>
      <div className="diff">( {diff >= 0 ? `+${diff}` : ` -${diff}`})</div>
      <div
        className="description"
        dangerouslySetInnerHTML={{ __html: percent }}
      ></div>
      <Loader isLoaded={isLoading} />
      {graph && (
        <div
          className="chart"
          id={`kpi-${id}-chart`}
          dangerouslySetInnerHTML={{
            __html: `${gradient[id]}${graph}`,
          }}
        ></div>
      )}
      {!isLoading && (
        <p
          className="chart-caption"
          dangerouslySetInnerHTML={{
            __html: caption,
          }}
        ></p>
      )}
    </div>
  );
};

Kpi.propTypes = {
  id: string,
  label: string,
  value: string,
  diff: string,
  caption: string,
  chartName: string,
  percent: string,
};

Kpi.defaultProps = {
  id: "",
  label: "",
  value: "",
  diff: "",
  caption: "",
  chartName: "",
  percent: "",
};

export default Kpi;
