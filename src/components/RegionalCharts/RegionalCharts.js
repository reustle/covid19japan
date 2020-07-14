const drawRegionChart = (chartName, element) => {
  let svgURL = `https://data.covid19japan.com/charts/${chartName}`;
  fetch(svgURL)
    .then((response) => {
      if (response.status == 200) {
        return response.text();
      }
      return "";
    })
    .then((text) => {
      if (element) {
        element.innerHTML = text;
      }
    });
};

export const drawRegionalCharts = (prefectureData, regionalData) => {
  for (let prefecture of prefectureData) {
    let prefectureId = prefecture.name.toLowerCase();
    let regionBox = document.querySelector(`#region-${prefectureId}`);
    if (regionBox) {
      let e;
      e = regionBox.querySelector(".confirmed .value");
      if (e) {
        e.innerHTML = `${prefecture.confirmed}`;
      }
      e = regionBox.querySelector(".confirmed .diff");
      if (e) {
        e.innerHTML = `(+${prefecture.newlyConfirmed})`;
      }
      let chartElement = regionBox.querySelector(".chart");
      drawRegionChart(`${prefectureId}_confirmed_daily.svg`, chartElement);
    }
  }

  if (regionalData) {
    for (let regionName of Object.keys(regionalData)) {
      let regionId = regionName.toLowerCase();
      let regionBox = document.querySelector(`#region-${regionId}`);
      if (regionBox) {
        let regionData = regionalData[regionName];
        let e = null;
        e = regionBox.querySelector(".active .value");
        if (e) {
          e.innerHTML = `${regionData.active}`;
        }
        e = regionBox.querySelector(".confirmed .value");
        if (e) {
          e.innerHTML = `${regionData.confirmed}`;
        }
        e = regionBox.querySelector(".confirmed .diff");
        if (e) {
          e.innerHTML = `(+${regionData.newlyConfirmed})`;
        }
        e = regionBox.querySelector(".deceased .value");
        if (e) {
          e.innerHTML = `${regionData.deceased}`;
        }
      }
    }
  }
};
