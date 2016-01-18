# ponies
A prototype for a responsive web app that visualizes service dependencies

## Setup / External dependencies

1. Node.Js, preferrable version 5.1+
1. Login credentials to administer questions.
1. An `.env` file containing environment config values. See [.env.example](.env.example) for the required key/value pairs.

## Getting started

1. `npm install --production`
1. `npm run start`
1. Visit [http://localhost:3000](http://localhost:3000)

## What you get

1. ExpressJs framework
1. Material design UI with AngularJs
1. Minor CSRF precautions
1. Gulp build process
1. ESLint and Stylint - linting
1. Git hooks for linting checks
1. Optional CircleCI integration
1. Optional Dockerfile generation

## What you don't get

The following items were left out due to the nature of this prototype. However all would normally be part of the development lifecycle.

1. Unit tests. The build process for tests is in place but I chose to forgo TDD for two reasons:
  1. In the interest of time vs long term gain
  1. Rapid prototyping in general is not tested
1. Code coverage (see above)
1. A Content security policy ([see helmet](https://github.com/helmetjs/helmet))
1. Trust issues. Behind the walls of an auth'd user, I assume the user is a "good web citizen"
1. Cross browser testing. Dev tested on Chrome, briefly checked on Firefox.
1. Windows install and support. This was developed on a Mac.

---

The MIT License (MIT) Copyright (c) 2016 Nate Clark

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
