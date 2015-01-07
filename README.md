# pjftv
Scrape TV and movie links from Project Free TV.

## Installation

    $ npm install pjftv

## Example

```javascript
var pjftv = require('pjftv');

pjftv('dr. strangelove', function (err, links) {
    if (!err && links && links.length) {
        console.log(links);
    }
});

pjftv({ title: 'simpsons', episode: 5, season: 7 }, function (err, links) {
    if (!err && links && links.length) {
        console.log(links);
    }
});
```

## API

### pjftv(terms, [options], done)

Search the Project Free TV website for links for a specific TV episode or movie.

`terms` is either a string or an object. If `terms` is a string, it's assumed to
be a movie title.
If it's an object it's expected to have some of the following properties:

```javascript
{
    title: String,
    year: Number?,
    episode: Number?,
    season: Number?,
    section: 'tv' | 'movies'?
}
```

*If episode and season are provided, section is assumed to be "tv".*

`options` is an optional object with the following optional properties:

```javascript
{
    host: 'http://www.free-tv-video-online.me'
    parallel: 5, // how many link pages to open at a time
    needle: { } // options passed into the needle instance
}
```

`done` is a callback which returns an array of links.

## License
MIT
