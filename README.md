# COVID19Japan.com

A COVID-19 Coronavirus tracker for Japan. Government agencies release detailed data, but in difficult to read formats and usually only in Japanese.


## Data Sources

For all information regarding the data powering this site, please visit the [covid19japan-data repo](https://github.com/reustle/covid19japan-data/)

Our data is sourced from a variety of sources, primarily Japanese news outlets like NHK, prefectural governments, and the Ministry of Health, Labour and Welfare.



## Contributing Code

If you would like to contribute features / refactor / etc, please create or comment on an issue on this repo, and tag @reustle


### Build Instructions

Requirements: NodeJS

Set up environment
```
npm install
```

Build once:
```
npm run build
```

Build continuously:
```
npm run watch
```

Start Server:
```
npm run start

# or run continuous build + server
npm run start-webpack
```

Build for production (minified):
```
npm run build-prod
```

You will now be able to access the site at http://localhost:4000/

## Code Re-use

The code for this project is released under the [MIT License](LICENSE). You are free to re-use it but we ask that you please include a link back to the [COVID-19 Japan website](https://covid19japan.com/) or [this GitHub repository](https://github.com/reustle/covid19japan). We'd also be happy to include your site in the list of forked projects below – just create an issue to request it.

### Forked Projects

* [Sri Lanka COVID-19 Coronavirus Tracker](https://covidsl.com)
* [Kerala COVID-19 Coronavirus Tracker](https://covid19kerala.info)

## Contributors

- [Shane Reustle](https://reustle.org): Development
- [Jiahui Zhou](https://jiahuizhou.design/): Concept, Design, and Data
- and [these developers](https://github.com/reustle/covid19japan/graphs/contributors)

## Other Resources
- [都道府県別新型コロナウイルス感染者数マッ (Arcgis)](https://jagjapan.maps.arcgis.com/apps/opsdashboard/index.html#/259ce3e3e2bf4c77876d4ecde6ea2564)
- [Data source from John Hopkins CSSE](https://github.com/CSSEGISandData/COVID-19)
- [News Digest Tracker](https://newsdigest.jp/pages/coronavirus/) (Unclear where the data is coming from)
- [BNO News Global Tracker](https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/) ([Google My Maps View](https://www.google.com/maps/d/u/0/viewer?mid=1a04iBi41DznkMaQRnICO40ktROfnMfMx&ll=37.45239782566561%2C137.6798301595186&z=6))
- [COVID-19 日本速報](https://japan-cov-19.now.sh/) ([Data Source](https://docs.google.com/spreadsheets/d/1HzOdYwWxSNmjHqDOYp3rq9tn0_vIILvRA47OF3DtKqc/edit#gid=1123835558))
- [Toyo Keizai Situation Report](https://toyokeizai.net/sp/visual/tko/covid19/) (Data from MHLW)
- [Patient connections and clusters map in Japan 新型コロナウイルスの事例マップ](https://www.coromap.info/)
- Wikipedia on 2020 Coronavirus Outbreak in Japan [English](https://en.wikipedia.org/wiki/2020_coronavirus_outbreak_in_Japan) and [Japanese](https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B2019%E5%B9%B4%E3%82%B3%E3%83%AD%E3%83%8A%E3%82%A6%E3%82%A4%E3%83%AB%E3%82%B9%E6%84%9F%E6%9F%93%E7%97%87%E3%81%AE%E6%B5%81%E8%A1%8C%E7%8A%B6%E6%B3%81) - Sources
