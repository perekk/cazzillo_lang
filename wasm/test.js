fetch('module.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.compile(bytes))
  .then(module => {
    // Inizializza l'istanza
    WebAssembly.instantiate(wasmCode, {env: {print: console.log}}).then(instance => {
        instance.exports.helloWorld();
    });
  });

