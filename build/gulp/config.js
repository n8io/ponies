const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const cwd = require('cwd');
const moment = require('moment');
const nib = require('nib');

const buildDir = cwd('build');
const srcDir = cwd('src');
const testDir = cwd('test');
const distDir = cwd('dist');
const bowerCfg = JSON.parse(fs.readFileSync(cwd('.bowerrc'), 'utf-8').toString());
const validEnvironments = {
  local: 'local',
  dev: 'dev',
  development: 'dev',
  qa: 'qa',
  uat: 'uat',
  prod: 'prod',
  production: 'prod'
};
const now = moment();

const cfg = {
  env: validEnvironments[process.env.NODE_ENV || ''] || validEnvironments.prod,
  clean: {
    src: [
      distDir
    ]
  },
  coverage: {
    src: [
      'src/**/*.js'
    ],
    options: {
      includeUntested: true
    },
    writeReportsOptions: {
      reporters: [
        'html',
        'lcov',
        'json',
        'text'
      ]
    },
    thresholdOptions: {
      thresholds: {
        global: {
          statements: 95,
          branches: 85,
          functions: 90,
          lines: 95
        },
        each: {
          statements: 90,
          branches: 70,
          lines: -20
        }
      }
    }
  },
  css: {
    src: path.join(srcDir, 'client/precompile/css/**/*.styl'),
    dest: {
      file: 'style.min.css',
      dir: path.join(distDir, 'css')
    },
    filter: ['**/_build.styl'],
    options: {
      local: {
        linenos: true,
        use: nib(),
        import: ['nib']
      },
      other: {
        compress: true,
        use: nib(),
        import: ['nib']
      }
    },
    banner: {
      formatStr: '/* Compiled via gulp-stylus on ${label} [ ${ms} ] */\n'
    }
  },
  lint: {
    css: {
      src: [
        path.join(srcDir, 'client/**/*.styl')
      ]
    }
  },
  'git-info': {
    dest: cwd('.git.json')
  },
  js: {
    client: {
      src: [
        path.join(srcDir, 'client/precompile/js/app/**/*.js'),
        path.join(srcDir, 'client/precompile/js/common/**/*.js')
      ],
      dest: path.join(distDir, 'js'),
      filename: 'script.min.js',
      jsbeautifier: {
        config: cwd('.jsbeautifyrc')
      },
      uglify: {
        mangle: true,
        compress: true
      },
      banner: {
        formatStr: '/* Compiled via gulp-uglify on ${label} [ ${ms} ] */\n'
      },
      ngAnnotate: {
        'single_quotes': true
      }
    },
    server: {
      src: [
        path.join(srcDir, 'server/**/*.js'),
        path.join(buildDir, '**/*.js'),
        path.join(testDir, '**/*.js')
      ]
    }
  },
  nodemon: {
    script: cwd(process.env['npm_package_main']),
    ext: 'js json',
    watch: [
      path.join(srcDir, 'server/**/*.js')
    ],
    env: {
      NODE_ENV: validEnvironments[process.env.NODE_ENV || ''] || validEnvironments.local
    },
    nodeArgs: ['--debug']
  },
  start: {
    ms: now.format('x'),
    label: now.format('dddd, MMMM Do YYYY, h:mm:ssA Z')
  },
  statics: {
    bower: {
      src: cwd(bowerCfg.directory),
      baseDir: './src/client/statics',
      dest: path.join(distDir, 'statics')
    }
  },
  test: {
    all: {
      src: [
        cwd('test/test.spec.js')
      ],
      options: {
        reporter: 'spec',
        growl: true
      }
    },
    unit: {
      src: [
        cwd('test/unit/unit.spec.js')
      ],
      options: {
        reporter: 'spec',
        growl: true
      }
    },
    integration: {
      src: [
        cwd('test/integration/integration.spec.js')
      ],
      options: {
        reporter: 'spec',
        growl: true
      }
    }
  },
  watch: {
    client: {
      src: [
        path.join(srcDir, 'client/precompile/js/**/*.js')
      ]
    }
  }
};

cfg.git = {
  commit: (shell.exec('git rev-parse --verify HEAD', {silent: true}).output || '').split('\n').join(''),
  branch: (shell.exec('git rev-parse --abbrev-ref HEAD', {silent: true}).output || '').split('\n').join('')
};

module.exports = cfg;
