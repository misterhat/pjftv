var async = require('async'),
    cheerio = require('cheerio'),
    needle = require('needle');

var HOST = 'http://www.free-tv-video-online.me';

function findFrame(url, options, done) {
    needle.get(url, options.needle, function (err, res, body) {
        var $;

        if (err) {
            return done(err);
        }

        try {
            $ = cheerio.load(body);
        } catch (e) {
            return done(e);
        }

        done(null, $('#vvdiv iframe').attr('src'));
    });
}

function search(section, terms, options, done) {
    needle.request('get', options.host + '/search/', {
        q: terms,
        md: section === 'tv' ? 'tv' : 'movies'
    }, options.needle, function (err, res, body) {
        var $, shows;

        if (err) {
            return done(err);
        }

        try {
            $ = cheerio.load(body);
        } catch (e) {
            return done(e);
        }

        shows = [];

        $('.mnlcategorylist').each(function () {
            var show = {};

            show.title = $('a', this).first().text().trim();
            show.id = $('a', this).first().attr('href');

            if (section === 'tv') {
                show.seasons = $('.info', this).eq(1).text().match(/\d+/g),
                show.episodes = $('.info', this).eq(2).text().match(/\d+/g);

                if (show.seasons) {
                    show.seasons = +show.seasons[0];
                }

                if (show.episodes) {
                    show.episodes = +show.episodes[0];
                }
            } else {
                show.genre = $('.info', this).eq(1).text().toLowerCase();
            }

            shows.push(show);
        });

        done(null, shows);
    });
}

function getLinks(terms, options, done) {
    var isTv = terms.season && terms.episode,
        url = options.host + terms.id;

    if (isTv) {
        url += 'season_' + terms.season + '.html';
    }

    needle.get(url, options.needle, function (err, res, body) {
        var $, links;

        if (err) {
            return done(err);
        }

        try {
            $ = cheerio.load(body);
        } catch (e) {
            return done(e);
        }

        links = [];

        $('.mnllinklist').each(function () {
            var url = $('a', this).first().attr('href').trim(),
                episode = $('div', this).first().text().match(/episode (\d+)/i);

            if (/^javascript/.test(url)) {
                return;
            }

            if (episode) {
                episode = +episode[1];

                if (episode === terms.episode) {
                    links.push(url);
                }
            } else {
                if (!isTv) {
                    links.push(url);
                }
            }
        });

        async.mapLimit(links, options.parallel || 5, function (link, done) {
            findFrame(link, options, done);
        }, function (err, links) {
            if (err) {
                return done(err);
            }

            links = links.filter(function (link) {
                return link;
            });

            done(null, links);
        });
    });
}

function quickLinks(terms, options, done) {
    var section;

    if (!done) {
        done = options;
        options = { };
    }

    options.host = options.host || HOST;
    options.needle = options.needle || {};

    options.needle.follow = true;

    section = options.section;

    if (!section) {
        section = terms.season && terms.episode ? 'tv' : 'movies';
    }

    if (typeof terms === 'string') {
        return search('movies', terms, options, function (err, movies) {
            if (err) {
                return done(err);
            }

            if (!movies || !movies.length) {
                return done(null, []);
            }

            getLinks({ id: movies[0].id }, options, function (err, links) {
                if (err) {
                    return done(err);
                }

                done(null, links, movies[0].id);
            });
        });
    }

    search(section, terms.title, options, function (err, shows) {
        if (err) {
            return done(err);
        }

        if (!shows || !shows.length) {
            return done(null, []);
        }

        getLinks({
            id: shows[0].id,
            episode: terms.episode,
            season: terms.season
        }, options, function (err, links) {
            if (err) {
                return done(err);
            }

            done(null, links, shows[0].id);
        });
    });
}

module.exports = quickLinks;
