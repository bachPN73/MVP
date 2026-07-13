const { NodeIO } = require('@gltf-transform/core');
const { draco } = require('@gltf-transform/functions');
const fs = require('fs');
const draco3d = require('draco3dgltf');

// Monkey-patch fs.readFileSync
const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function (path, options) {
    if (typeof path === 'string' && path.includes('unknownmaterial')) {
        console.log('Intercepted reading of unknown material:', path);
        // Return a dummy 1x1 PNG
        return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    }
    return originalReadFileSync.apply(this, arguments);
};

// Monkey-patch fs.promises.readFile and fs.readFile correctly
const originalReadFilePromise = fs.promises.readFile;
fs.promises.readFile = async function(path, ...args) { 
    if (typeof path === 'string' && path.includes('unknownmaterial')) {
        return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'); 
    }
    return originalReadFilePromise.apply(this, arguments); 
};

const originalReadFile = fs.readFile;
fs.readFile = function (path, ...args) {
    if (typeof path === 'string' && path.includes('unknownmaterial')) {
        console.log('Intercepted reading of unknown material:', path);
        const cb = args[args.length - 1];
        if (typeof cb === 'function') {
            return cb(null, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
        }
    }
    return originalReadFile.apply(this, arguments);
};

async function compress(inputFile, outputFile) {
    console.log('Loading file:', inputFile);
    const io = new NodeIO();
    // Register Draco compression dependency
    io.registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
    });

    try {
        const document = await io.read(inputFile);
        console.log('Loaded document. Applying Draco compression...');
        
        await document.transform(
            draco({ method: 'edgebreaker', quantizationVolume: 'scene' })
        );
        
        console.log('Writing compressed file to', outputFile);
        await io.write(outputFile, document);
        console.log('Successfully compressed', inputFile, 'to', outputFile);
    } catch (e) {
        console.error("Compression failed:", e);
    }
}

compress(process.argv[2], process.argv[3]).catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
