var fs = require('fs'),
    path = require('path');

var fontnik = require('fontnik'),
    glyphCompose = require('@mapbox/glyph-pbf-composite');

var DEBUG = false;

/** Script directory — not process.cwd(), so `node generate.js` works from anywhere */
var rootDir = __dirname;
var outputDirAbs = path.join(rootDir, '_output');

var sizeSumTotal = 0;

if (!fs.existsSync(outputDirAbs)) {
  fs.mkdirSync(outputDirAbs);
}

var SKIP_DIRS = new Set(['node_modules', '_output', '.git']);

function filterCommentedSources(fonts) {
  fonts.forEach(function(font) {
    font.sources = font.sources.filter(function(f) {
      return f.indexOf('//') === -1;
    });
  });
}

function loadFontsJson(fontsJsonPath) {
  if (!fs.existsSync(fontsJsonPath)) {
    return null;
  }
  var raw = fs.readFileSync(fontsJsonPath, 'utf8');
  var fonts = JSON.parse(raw);
  if (!Array.isArray(fonts)) {
    return null;
  }
  filterCommentedSources(fonts);
  return fonts;
}

function readFontSource(dir, familyName, sourceName) {
  var candidates = [
    path.join(dir, sourceName),
    path.join(dir, familyName, sourceName),
  ];
  for (var i = 0; i < candidates.length; i++) {
    try {
      return fs.readFileSync(candidates[i]);
    } catch (e) {}
  }
  return null;
}

function autoDiscoverFonts(dir) {
  var fonts = [];
  fs.readdirSync(dir).forEach(function(file) {
    var ext = path.extname(file);
    if (ext === '.ttf' || ext === '.otf') {
      var rex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;
      fonts.push({
        name: path.basename(file).slice(0, -4).replace('-', '').replace(rex, '$1$4 $2$3$5'),
        sources: [path.basename(file)]
      });
    }
  });
  return fonts;
}

var doFonts = function(dir, fonts) {
  var makeGlyphs = function(config) {
    var sourceFonts = {};

    var folderName = path.join(outputDirAbs, config.name);
    console.log(folderName);
    config.sources.forEach(function(sourceName) {
      if (!sourceFonts[sourceName]) {
        var buf = readFontSource(dir, config.name, sourceName);
        if (buf) {
          sourceFonts[sourceName] = buf;
        }
      }
    });

    var missing = config.sources.filter(function(name) {
      return !sourceFonts[name];
    });
    if (missing.length === config.sources.length) {
      console.log(
        '[%s] Skipping — add .otf/.ttf to the batch folder (see fonts.json "sources"):\n' +
        '  %s  OR  %s/<file>',
        config.name,
        path.join(dir, missing[0]),
        path.join(dir, config.name)
      );
      console.log('  Missing: %s', missing.join(', '));
      return Promise.resolve();
    }

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    var sizeSum = 0;
    var histogram = new Array(256);

    var doRange = function(start, end) {
      return Promise.all(config.sources.map(function(sourceName) {
        var source = sourceFonts[sourceName];
        if (!source) {
          console.log('[%s] Source "%s" not found', config.name, sourceName);
          return Promise.resolve();
        }

        return new Promise(function(resolve, reject) {
          fontnik.range({
            font: source,
            start: start,
            end: end
          }, function(err, data) {
            if (err) {
              reject();
            } else {
              resolve(data);
            }
          });
        });
      })).then(function(results) {
        results = results.filter(function(r) {return !!r;});
        if (!results.length) {
          return;
        }
        var combined = glyphCompose.combine(results);
        if (!combined || !combined.length) {
          return;
        }
        var size = combined.length;
        sizeSum += size;
        histogram[start / 256] = size;
        if (DEBUG) {
          console.log('[%s] Range %s-%s size %s B', config.name, start, end, size);
        }
        fs.writeFileSync(path.join(folderName, start + '-' + end + '.pbf'), combined);
      });
    };

    var ranges = [];
    for (var i = 0; i < 65536; (i = i + 256)) {
      ranges.push([i, Math.min(i + 255, 65535)]);
    }

    console.log('[%s]', config.name);
    var fontPromise;
    if (DEBUG) {
      return ranges.reduce(function(p, range) {
          return p.then(function() {
            return doRange(range[0], range[1]);
          });
        }, Promise.resolve()
      );
    } else {
      fontPromise = Promise.all(ranges.map(function(range) {
        return doRange(range[0], range[1]);
      }));
    }
    return fontPromise.then(function() {
      console.log(' Size histo [kB]: %s', histogram.map(function(v) {
          return v > 512 ? Math.round(v / 1024) : '';
        }).join('|'));
      console.log(' Total size %s B', sizeSum);
      sizeSumTotal += sizeSum;
    });
  };

  return fonts.reduce(function(p, font) {
      return p.then(function() {
        return makeGlyphs(font);
      });
    }, Promise.resolve()
  );
};

var todo = [];

var rootFonts = loadFontsJson(path.join(rootDir, 'fonts.json'));
if (rootFonts && rootFonts.length) {
  todo.push([rootDir, rootFonts]);
}

fs.readdirSync(rootDir).forEach(function(name) {
  if (SKIP_DIRS.has(name)) {
    return;
  }
  var full = path.join(rootDir, name);
  if (!fs.statSync(full).isDirectory()) {
    return;
  }

  var fonts = loadFontsJson(path.join(full, 'fonts.json'));
  if (!fonts || !fonts.length) {
    fonts = autoDiscoverFonts(full);
  }
  if (fonts && fonts.length) {
    todo.push([full, fonts]);
  }
});

if (!todo.length) {
  console.log('No fonts.json or .ttf/.otf batches found under %s', rootDir);
  process.exit(1);
}

todo.reduce(function(p, pair) {
    return p.then(function() {
      console.log('Directory [%s]:', pair[0]);
      return doFonts(pair[0], pair[1]);
    });
  }, Promise.resolve()
).then(function() {
  console.log('Total size %s B', sizeSumTotal);
});
