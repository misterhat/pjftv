var pjftv = require('./');

pjftv('dr. strangelove', function (err, links, id) {
    if (!err && links && links.length) {
        console.log(id, links);
    }
});

pjftv({ title: 'simpsons', episode: 5, season: 7 }, function (err, links) {
    if (!err && links && links.length) {
        console.log(links);
    }
});
