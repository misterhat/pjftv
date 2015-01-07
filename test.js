var tap = require('tap').test,

    pjftv = require('./');

tap('finding links', function (test) {
    test.plan(1);

    pjftv({
        title: 'dr. katz',
        season: 5,
        episode: 11
    }, function (err, links) {
        test.ok(!err && links && links.length, 'tv episode links');
    });
});
