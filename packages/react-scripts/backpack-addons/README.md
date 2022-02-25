Our react scripts fork includes a number of custom configuration items in order to support building web products at Skyscanner. The table below will describe what each of the configs do

| Feature | Description | Default Value |
|:---|:--|:---|
| **babelIncludePrefixes** | Array of module name prefixes to opt into babel compilation. <br> Default includes **@skyscanner/bpk-, bpk- and saddlebag-** packages by default to be compiled | **[@skyscanner/bpk-, bpk- and saddlebag-]** |
| **sriEnabled** | Determines if Subresource Intergrity is used during build to add an integrity hash for files. <br> The SRI is a security feature to enable browsers to verify the files they fetch are unmodified. <br> If enabled crossOriginLoading value is overriden with anonymous to allow output to have integrity value <br> See [webpack subresource integrity docs](https://github.com/waysact/webpack-subresource-integrity/blob/master/README.md) | **false** (this is currently the default in the future security may want to make it true by default but pending them still trying things about) |
| **crossOriginLoading** | Option to enable cross origin loading of chunks to modify the default webpack behaviour of being false. <br> Docs: https://webpack.js.org/configuration/output/#outputcrossoriginloading | **false** |
