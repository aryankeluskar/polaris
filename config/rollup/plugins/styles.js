const {resolve: resolvePath, dirname} = require('path');
const postcss = require('postcss');
const {readFileSync, outputFileSync} = require('fs-extra');
const {renderSync} = require('node-sass');
const {createFilter} = require('rollup-pluginutils');
const cssnano = require('cssnano');

const cssModulesExtractImports = require('postcss-modules-extract-imports');
const cssModulesLocalByDefault = require('postcss-modules-local-by-default');
const cssModulesScope = require('postcss-modules-scope');
const cssModulesValues = require('postcss-modules-values');
const Parser = require('postcss-modules-parser');
const postcssShopify = require('postcss-shopify');

const generateScopedName = require('../namespaced-classname');

module.exports = function styles(options = {}) {
  const filter = createFilter(
    options.include || ['**/*.css', '**/*.scss'],
    options.exclude,
  );

  const {output, includePaths = [], includeAlways = []} = options;
  const cssAndTokensByFile = {};

  const includeAlwaysSource = includeAlways
    .map((resource) => readFileSync(resource, 'utf8'))
    .join('\n');

  const processor = postcss([
    cssModulesValues,
    cssModulesLocalByDefault,
    cssModulesExtractImports,
    cssModulesScope({generateScopedName}),
    new Parser({
      fetch(to, from) {
        const fromDirectoryPath = dirname(from);
        const toPath = resolvePath(fromDirectoryPath, to);
        const source = readFileSync(toPath, 'utf8');
        return getPostCSSOutput(processor, source, toPath);
      },
    }),
    postcssShopify(),
  ]);

  return {
    name: 'shopify-styles',

    transform(source, id) {
      if (!filter(id)) {
        return null;
      }

      const sassOutput = renderSync({
        data: `${includeAlwaysSource}\n${source}`,
        includePaths: includePaths.concat(dirname(id)),
      }).css.toString();
      const postCssOutput = getPostCSSOutput(processor, sassOutput, id);

      cssAndTokensByFile[id] = postCssOutput;

      const properties = JSON.stringify(postCssOutput.tokens, null, 2);
      return `export default ${properties};`;
    },
    async generateBundle(generateOptions, bundles) {
      if (typeof output !== 'string') {
        return null;
      }

      // Items are added to cssAndTokensByFile in an unspecified order as
      // whatever transform gets resolved first appears first. The contents of
      // the css file should use the order in which scss files were referenced
      // in the compiled javascript file.
      const styleIds = Object.keys(cssAndTokensByFile);
      const includedStyleIds = Array.from(
        Object.values(bundles).reduce((memo, bundle) => {
          Object.keys(bundle.modules).forEach((moduleName) => {
            if (styleIds.includes(moduleName)) {
              memo.add(moduleName);
            }
          });
          return memo;
        }, new Set()),
      );

      const {cssArray, tokensByFile} = includedStyleIds.reduce(
        (memo, id) => {
          memo.cssArray.push(cssAndTokensByFile[id].css);
          memo.tokensByFile[id] = cssAndTokensByFile[id].tokens;
          return memo;
        },
        {cssArray: [], tokensByFile: {}},
      );
      const css = cssArray.join('\n\n');
      const tokens = `${JSON.stringify(tokensByFile, null, 2)}\n`;
      const minifiedCss = (await cssnano.process(css, {
        from: generateOptions.file,
      })).css;

      outputFileSync(output, css);
      outputFileSync(`${output.slice(0, -4)}.min.css`, minifiedCss);
      outputFileSync(`${output.slice(0, -4)}.tokens.json`, tokens);
    },
  };
};

function getPostCSSOutput(processor, source, path) {
  const result = processor.process(source, {from: path});
  return {path, css: result.css, tokens: result.root.tokens};
}
