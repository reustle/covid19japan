//const http = require("http");
const drive = require("drive-db")

const SHEET = "1jfB4muWkzKTR0daklmf8D5F0Uf_IYAgcx_-Ij9McClQ"
const SHEET_PREFECTURES_TAB = 2
const SHEET_DAILY_SUM_TAB = 3
const SHEET_LAST_UPDATED_TAB = 4
const CACHE = 5 * 60 // ~5 min

const tabs = {
  prefectures: SHEET_PREFECTURES_TAB,
  daily: SHEET_DAILY_SUM_TAB,
  updated: SHEET_LAST_UPDATED_TAB
}

const readAndSave = async tab => {
  const data = await drive({ sheet: SHEET, tab: tabs[tab], cache: CACHE });
  // write somehow `JSON.stringify(data)` in `${tab}.json`
}

Promise.all(Object.keys(tabs).map(readAndSave))
