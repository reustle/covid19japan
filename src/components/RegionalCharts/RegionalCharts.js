const drawRegionChart = (chartName, element) => {
  let svgURL = `http://localhost:3999/charts/${chartName}`;
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
      let valueElement = regionBox.querySelector(".value");
      valueElement.innerHTML = `${prefecture.active}`;
      let diffElement = regionBox.querySelector(".diff");
      diffElement.innerHTML = `(+${prefecture.newlyConfirmed})`;
      let descriptionElement = regionBox.querySelector(".description");
      descriptionElement.innerHTML = `${prefecture.confirmed} total cases, ${prefecture.recovered} recovered`;
      let chartElement = regionBox.querySelector(".chart");
      drawRegionChart(`${prefectureId}_confirmed_daily_avg.svg`, chartElement);
    }
  }

  if (regionalData) {
    for (let regionName of Object.keys(regionalData)) {
      let regionId = regionName.toLowerCase();
      let regionBox = document.querySelector(`#region-${regionId}`);
      if (regionBox) {
        let regionData = regionalData[regionName];
        let valueElement = regionBox.querySelector(".value");
        valueElement.innerHTML = `${regionData.active}`;
        let diffElement = regionBox.querySelector(".diff");
        diffElement.innerHTML = `(+${regionData.newlyConfirmed})`;
        let descriptionElement = regionBox.querySelector(".description");
        descriptionElement.innerHTML = `${regionData.confirmed} total cases, ${regionData.recovered} recovered`;
      }
    }
  }
};
