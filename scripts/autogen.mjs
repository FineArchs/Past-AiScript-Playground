import * as fs from 'node:fs/promises';
import semverValid from 'semver/functions/valid.js';
import semverGte from 'semver/functions/gte.js';
import semverRSort from 'semver/functions/rsort.js';

async function getIndexTses() {
  const files = await fs.readdir('./src/template');
  const indextses = files.filter(
    file => file.startsWith('index_')
  );
  return indextses.map(filename => [
    filename,
    filename.match(/index_(.+)\.ts$/)[1].replaceAll('_', '.'),
  ]);
}

async function copyVersion(ver) {
  const tmpl = await fs.readFile(
    './src/template/version.ts.tmpl',
    { encoding: 'utf8' },
  );
  const generated = [
    ['version', ver],
    ['package_name', 'aiscript_' + ver.replaceAll('.', '_')],
  ].reduce((acc, [tag, value]) => acc.replaceAll(`<<${tag}>>`, value), tmpl);
  await fs.writeFile(`src/versions/${ver}/version.ts`, generated);
}

async function copyIndex(ver) {
  const pkgjson = await fs.readFile(
    `./aiscripts/${ver}/package.json`,
    { encoding: 'utf8' },
  );
  const pkgver = JSON.parse(pkgjson).version;
  for (const [indexts, indextsver] of indexTSes) {
    if (semverGte(pkgver, indextsver)) {
      await fs.cp(
        `./src/template/${indexts}`,
        `./src/versions/${ver}/index.ts`
      );
      return;
    }
  }
  throw new Error(`${pkgver} is greater than no index_*.ts.`);
}

async function genVersions(_vers) {
  const tagvers = _vers.filter(v => !semverValid(v));
  const semvers = semverRSort(
    _vers.filter(v => semverValid(v))
  );
  const vers = [...tagvers, ...semvers].map(
    v => ({ v, mod: 'V' + v.replaceAll('.', '_') })
  );
  const imports = vers.map(
    ({v, mod}) => `import * as ${mod} from "@/versions/${v}/index.ts";`
  );
  const versions = vers.map(({v}) => `  "${v}",`);
  const vmodules = vers.map(
    ({v, mod}) => `  "${v}": ${mod},`
  );
  const generated = [
    ...imports,
    '',
    'export const versions = [',
    ...versions,
    '] as const;',
    'export const vmodules = {',
    ...vmodules,
    '} as const;',
    `export const latest = "${semvers[0]}";`
  ].join('\n');
  await fs.writeFile('./src/versions/versions.ts', generated);
}


const [vers, _, indexTSes] = await Promise.all([
  fs.readdir('./aiscripts'),
  fs.rm('./src/versions', { recursive: true, force: true })
    .then(() => fs.mkdir('./src/versions')),
  getIndexTses(),
]);

await Promise.all([
  genVersions(vers),
  ...vers.map(
    async (ver) => {
      await fs.mkdir(`./src/versions/${ver}`);
      await Promise.all([
        copyVersion(ver),
        copyIndex(ver),
      ]);
    }
  )
]);
