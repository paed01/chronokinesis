// From https://github.com/hapijs/joi/blob/master/generate-readme-toc.js

const Toc = require('markdown-toc');
const Fs = require('fs');
const Package = require('./package.json');

const internals = {
  filename: './README.md',
};

internals.generate = function generate() {
  const api = Fs.readFileSync(internals.filename, 'utf8');
  const tocOptions = {
    bullets: '-',
    slugify(text) {
      return text
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/[^\w-]/g, '');
    },
  };

  const output = Toc.insert(api, tocOptions).replace(
    /<!-- version -->(.|\n)*<!-- versionstop -->/,
    '<!-- version -->\n# ' + Package.version + ' API Reference\n<!-- versionstop -->',
  );

  Fs.writeFileSync(internals.filename, output);
};

internals.generate();
