/* eslint-disable */

const ts = require('rollup-plugin-typescript2');
const pkg = require('../package.json')
const version = process.env.VERSION || pkg.version

const pkgname = pkg.name

const banner =
  '/*!\n' +
  ` * ${pkgname}.js v${version}\n` +
  ` * (c) 2021-${new Date().getFullYear()} Teng Mao Qing\n` +
  ' * Released under the MIT License.\n' +
  ' */'

const builds = {
  'web-compile': {
    entry: ['src/index.ts', 'src/helper.ts'],
    format: 'cjs',
    external: ['jsdom'],
    banner,
    dir: 'dist'
  },
  'web-esm': {
    entry: ['src/index.ts', 'src/helper.ts'],
    format: 'es',
    external: ['jsdom'],
    banner,
    dir: 'es'
  }
}

function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      ts({
        tsconfig: './tsconfig.json'
      }),
    ],
    output: {
      // file: opts.dest,
      dir: opts.dir,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || pkgname,
      exports: 'auto'
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

module.exports = Object.keys(builds).map(genConfig)
