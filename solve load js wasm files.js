// I finally found what is the right way to load a wasm application in a wasm-bindgen project!

// In fact, everything was on this page

// When you compile the project without wanting to run it with a bundler, you have to run wasm-pack build with a --target flag.

wasm-pack build --release --target web

// This creates a .js file (pkg/test_wasm.js in my example) with everything you need to load the wasm-application.

// And then this is how you use the functions created by wasm-bindgen (index.js):

import init from './pkg/test_wasm.js';
import {ex_function, ex_Struct ...} from '../pkg/test_wasm.js';

function run {
    // use the function ex_function1 here

}

init().then(run)

// You include your index.js in your HTML file

<script type="module" src="./index.js"></script>

// and than it's work