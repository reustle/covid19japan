# COVID19Japan.com

A community powered COVID-19 coronavirus tracker for Japan.

The project is a single page JavaScript application running in the browser, pulling data in via a JSON file, and hosted on GitHub Pages.

## Data Sources

For all information regarding the data powering this site, please visit the [covid19japan-data repo](https://github.com/reustle/covid19japan-data/).

Our data is sourced from a variety of sources, primarily Japanese news outlets like NHK, prefectural governments, and the Ministry of Health, Labour and Welfare.

## Contributing Code

If you would like to contribute features, refactor code, etc., please create or comment on an issue on this repo, and one of the core contributors listed below.

## Running Dev Locally

### Build Instructions

Requirements: NodeJS

Set up the environment:

```
npm install
```

Build the code continuously & serve it:

```
npm run start-webpack
```

You will now be able to access the site at http://localhost:4000/

### More Commands

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
```

### Testing

When testing your changes locally, be sure to verify both the `/` and `/embed` pages are working properly.

### Localization

#### Localizing content

All strings in the `src/` files should be localized like this:

1. Add a key-value pair in `src/i18n/en.json` for your string/text
2. For HTML: add the `data-i18n="your-new-key"` attribute to the HTML element to be localized (replace "your-new-key" in the example)
3. For JavaScript: call the `i18next.t("your-new-key")` function to retrieve the localized string (replace "your-new-key" in the example)
4. Add any additional translations with the same key to other files in `src/i18n/`

#### Adding new languages

To add a new language

1. Make a copy of an existing localization file (recommended: `src/i18n/en.json`), name it to match the new language (e.g. `ja.json`)
2. Replace the translations in the file you just created
3. Add the new language to the array of `LANGUAGES` in `src/i18n/index.js`

## License & Code Re-use

The code for this project is released under the [MIT License](LICENSE). You are free to re-use it but we ask that you please include a link back to the [COVID-19 Japan website](https://covid19japan.com/) or [this GitHub repository](https://github.com/reustle/covid19japan). We'd also be happy to include your site in the list of forked projects below – just create an issue to request it.

### Forked Projects

- [Sri Lanka COVID-19 Coronavirus Tracker](https://covidsl.com)
- [Kerala COVID-19 Coronavirus Tracker](https://covid19kerala.info)

## Core Contributors

- [Shane Reustle](https://reustle.org)
- [Alastair Tse](https://github.com/liquidx)
- [Leonard Chin](https://github.com/l15n)
- [Jiahui Zhou](https://jiahuizhou.design/) _(concept and design)_
- and [these wonderful developers](https://github.com/reustle/covid19japan/graphs/contributors)
