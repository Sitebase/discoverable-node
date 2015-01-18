var discoverable = require('../src/index');

discoverable.search(['test', 'test2'], function( address ) {
	console.log('Discovered server address', address);
});