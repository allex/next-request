import path from 'path'
import babelrc from '.babelrc'
import { version, name, author, license, dependencies, repository } from './package.json'

const banner = (name, short = false) => {
  let s;
  if (short) {
    s = `/* ${name} v${version} | ${repository} */`
  } else {
    s = `/**
 * ${name} v${version}
 *
 * @author ${author}
 * Released under the ${license} License.
 */\n`
  }
  return s
}

export default {
  destDir: path.join(__dirname, './lib'),
  dependencies,
  pluginOptions: {
    babel (rollupCfg) {
      const cfg = {
        babelrc: true,
        externalHelpers: false,
        runtimeHelpers: false
      }
      return cfg
    }
  },
  entry: [ {
    input: 'src/index.js',
    plugins: [ 'babel', 'resolve', 'commonjs' ],
    output: [
      { format: 'umd', name: 'nextRequest', file: 'index.min.js', banner: banner(name) },
      { format: 'es', file: 'index.esm.js', banner: banner(name, true) } ]
  } ]
}
