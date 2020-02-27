'use strict';

const PREFECTURE_JSON_PATH = 'static/prefectures.geojson'
const JSON_PATH = 'https://covid19japan.s3.ap-northeast-1.amazonaws.com/data.json'
const TIME_FORMAT = 'YYYY-MM-DD'
const COLOR_CONFIRMED = 'rgb(244,67,54)'
const COLOR_RECOVERED = 'rgb(25,118,210)'
const COLOR_DECEASED = 'rgb(55,71,79)'
const COLOR_INCREASE = 'rgb(163,172,191)'
const PAGE_TITLE = 'Coronavirus Disease (COVID-19) Japan Tracker'
let LANG = 'en'

// Global vars
let ddb = {
  prefectures: undefined,
  trend: undefined,
  totals: {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
  }
}


function loadData(callback) {
  // Load the json data file
  
  fetch(JSON_PATH).then(function(res){
    return res.json()
  })
  .then(function(data){
    callback(data)
  })
}


function calculateTotals(prefectures) {
  // Calculate the totals
  
  let totals = {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
  }
  
  prefectures.map(function(pref){
    // TODO change to confirmed
    totals.confirmed += (pref.cases?parseInt(pref.cases):0)
    totals.recovered += (pref.recovered?parseInt(pref.recovered):0)
    // TODO changed to deceased
    totals.deceased += (pref.deaths?parseInt(pref.deaths):0)
    
  })
  
  return totals
}

function drawTrendChart(sheetTrend) {
  
  let lastUpdated = ''
  let labelSet = []
  let confirmedSet = []
  let recoveredSet = []
  let deceasedSet = []
  let dailyIncreaseSet = []

  let prevConfirmed = -1
  sheetTrend.map(function(trendData){
    labelSet.push(new Date(trendData.date))
    confirmedSet.push({
      x: new Date(trendData.date),
      y: parseInt(trendData.confirmed)
    })
    recoveredSet.push({
      x: new Date(trendData.date),
      y: parseInt(trendData.recovered)
    })
    deceasedSet.push({
      x: new Date(trendData.date),
      y: parseInt(trendData.deceased)
    })
    dailyIncreaseSet.push({
      x: new Date(trendData.date),
      y: prevConfirmed === -1 ? 0 : parseInt(trendData.confirmed) - prevConfirmed
    })
    
    prevConfirmed = parseInt(trendData.confirmed)
    lastUpdated = trendData.date
  })
  
  var ctx = document.getElementById('trend-chart').getContext('2d')
  Chart.defaults.global.defaultFontFamily = "'Open Sans', helvetica, sans-serif"
  Chart.defaults.global.defaultFontSize = 16
  Chart.defaults.global.defaultFontColor = 'rgb(0,10,18)'
  
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labelSet,
        datasets: [
          {
            label: 'Deceased',
            borderColor: COLOR_DECEASED,
            backgroundColor: COLOR_DECEASED,
            fill: false,
            data: deceasedSet
          },
          {
            label: 'Recovered',
            borderColor: COLOR_RECOVERED,
            backgroundColor: COLOR_RECOVERED,
            fill: false,
            data: recoveredSet
          },
          {
            label: 'Confirmed',
            borderColor: COLOR_CONFIRMED,
            backgroundColor: COLOR_CONFIRMED,
            fill: false,
            data: confirmedSet
          },
          {
            label: 'Daily Increase',
            borderColor: COLOR_INCREASE,
            backgroundColor: COLOR_INCREASE,
            fill: false,
            data: dailyIncreaseSet
          }
        ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      elements: {
        line: {
            tension: 0.1
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            parser: TIME_FORMAT,
            round: 'day',
            tooltipFormat: 'll'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Cases'
          }
        }]
      }
    }
  });
}


function drawPrefectureTable(prefectures, totals) {
  // Draw the Cases By Prefecture table
  
  let dataTable = document.querySelector('#prefectures-table tbody')
  let unspecifiedRow = ''
  
  // Remove the loading cell
  dataTable.innerHTML = ''
  
  // Parse values so we can sort
  _.map(prefectures, function(pref){
    // TODO change to confirmed
    pref.confirmed = (pref.cases?parseInt(pref.cases):0)
    pref.recovered = (pref.recovered?parseInt(pref.recovered):0)
    // TODO change to deceased
    pref.deceased = (pref.deaths?parseInt(pref.deaths):0)
  })
  
  // Iterate through and render table rows
  _.orderBy(prefectures, 'confirmed', 'desc').map(function(pref){
    if(!pref.confirmed && !pref.recovered && !pref.deceased){
      return
    }
    
    let prefStr
    if(LANG == 'en'){
        prefStr = pref.prefecture
    }else{
      prefStr = pref.prefectureja
    }
    
    // TODO Make this pretty
    
    if(pref.prefecture == 'Unspecified'){
      // Save the "Unspecified" row for the end of the table
      unspecifiedRow = "<tr><td><em>" + prefStr + "</em></td><td>" + pref.confirmed + "</td><td>" + pref.recovered + "</td><td>" + pref.deaths + "</td></tr>"
    }else{
      dataTable.innerHTML = dataTable.innerHTML + "<tr><td>" + prefStr + "</td><td>" + pref.confirmed + "</td><td></td><td>" + (pref.deceased?pref.deceased:'') + "</td></tr>"
    }
    return true
  })
  
  dataTable.innerHTML = dataTable.innerHTML + unspecifiedRow
  
  let totalStr = 'Total'
  if(LANG == 'ja'){
    totalStr = '計'
  }
  
  dataTable.innerHTML = dataTable.innerHTML + "<tr class='totals'><td>" + totalStr + "</td><td>" + totals.confirmed + "</td><td>" + totals.recovered + "</td><td>" + totals.deceased + "</td></tr>"
}


function drawKpis(totals) {
  // Draw the KPI values

  document.querySelector('#kpi-confirmed').innerHTML = totals.confirmed
  document.querySelector('#kpi-recovered').innerHTML = totals.recovered
  document.querySelector('#kpi-deceased').innerHTML = totals.deceased
}


function drawLastUpdated(lastUpdated) {
  // Draw the last updated time
  
  // TODO we should be parsing the date, but I
  // don't trust the user input on the sheet
  //let prettyUpdatedTime = moment(lastUpdated).format('MMM D, YYYY') + ' JST'
  document.getElementById('last-updated').innerHTML = lastUpdated
}


function drawPageTitleCount(confirmed) {
  // Update the number of confirmed cases in the title
  
  document.title = "(" + confirmed + ") " + PAGE_TITLE
}


function drawMapPrefectures() {

  // Go through all prefectures looking for cases
  let japanMapSvg = document.querySelector(`#map-japan-svg`).contentDocument

  ddb.prefectures.map(function(prefecture){
    let uppercasePrefectureName = prefecture.prefecture.toUpperCase()
    let prefecturePath = japanMapSvg.querySelector(`#${uppercasePrefectureName}`)
    if (prefecturePath == null) {
      console.log('Prefecture not found', uppercasePrefectureName)
      return
    } else {
      console.log('Prefecture found', prefecturePath)
    }

    let cases = parseInt(prefecture.cases)
    if(cases > 0){      
      if(cases <= 10){
        // 1-10 cases
        prefecturePath.setAttribute('fill', 'rgb(253,234,203)')
      }else if(cases <= 25){
        // 11-25 cases
        prefecturePath.setAttribute('fill', 'rgb(251,155,127)')
      }else if(cases <= 50){
        // 26-50 cases
        prefecturePath.setAttribute('fill', 'rgb(244,67,54)')
      }else{
        // 51+ cases
        prefecturePath.setAttribute('fill', 'rgb(186,0,13)')
      }
    }    
  })
  
}


function initDataTranslate() {
  // Handle language switching
  
  const selector = '[data-ja]'
  const parseNode = function(cb) {
    document.querySelectorAll(selector).forEach(cb)
  }

  // Default website is in English. Extract it as the attr data-en="..."
  parseNode(function(el) {
    el.dataset['en'] = el.textContent
  })

  // Language selector event handler
  document.querySelectorAll('[data-lang-picker]').forEach(function(pick) {
    pick.addEventListener('click', function(e){
      e.preventDefault()
      LANG = e.target.dataset.langPicker
      
      // Toggle the html lang tags
      parseNode(function(el) {
        if (!el.dataset[LANG]) return;
        el.textContent = el.dataset[LANG]
      })
      
      // Redraw the prefectures table
      if(document.getElementById('prefectures-table')){
        drawPrefectureTable(ddb.prefectures, ddb.totals)
      }
      
      // Toggle the lang picker
      document.querySelectorAll('a[data-lang-picker]').forEach(function(el){
        el.style.display = 'inline'
      })
      document.querySelector('a[data-lang-picker='+LANG+']').style.display = 'none'
      
    })
  })
}
