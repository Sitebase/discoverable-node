/* 
 * discoverable-node
 *
 * Copyright (c) 2014 Sitebase (Wim Mostmans) and project contributors.
 *
 * discoverable-node's license follows:
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, 
 * publish, distribute, sublicense, and/or sell copies of the Software, 
 * and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * This license applies to all parts of discoverable-node that are not externally
 * maintained libraries.
 */
var dgram = require("dgram");

/******************* SERVER ********************/
function listen( tags )
{
  var server = dgram.createSocket("udp4");
  server.on("message", function (msg, rinfo) {
    var parts = msg.toString().split(':');
    var action = parts.shift();
    var searched_tags = parts.shift().split(',');

    if( action !== 'discover' || ! _match(tags, searched_tags) ) 
      return false;

    // Ping client to let it know the IP address
    var message = new Buffer("tester");
    server.send(message, 0, message.length, rinfo.port, rinfo.address);
  });
  server.on("listening", function () {
    var address = server.address();
  });
  server.bind(41234);
}

/******************* CLIENT ********************/
function search( tags, callback )
{
  var client = dgram.createSocket("udp4");
  var retryTimer = null;

  client.bind();

  /**
   * Listen for a ping message from a discoverable device
   * @param  {string} msg 
   * @param  {object} rinfo
   * @return {void}
   */
  client.on("message", function (msg, rinfo) {

    if( callback )
      callback( rinfo.address );

    clearTimeout( retryTimer );
    client.close();
  }); 

  /**
   * When started listening broadcast a message on the network
   * to find discoverable devices
   * @return {void}
   */
  client.on('listening', function broadcast()
  {
    // When client is closed we can't do a broadcast again
    if( ! client )
      return null;

    var message = new Buffer('discover:' + tags.join(','));
    client.setBroadcast(true);
    client.send(message, 0, message.length, 41234, "255.255.255.255", function(err, bytes) {
      retryTimer = setTimeout(function() {
        broadcast();
      }, 5000);
    });
  });

}

/**
 * Check if one of the items in the first array argument exist
 * in the second array argument
 * @param  {array} arr1 
 * @param  {array} arr2 
 * @return {boolean}      
 */
function _match( arr1, arr2 )
{
  for(var i=0 ; i < arr1.length ; i++)
  {
    if( arr2.indexOf(arr1[i]) > -1 )
      return true;
  }
  return false;
}

module.exports = {
    makeDiscoverable: listen,
    search: search,
    _match: _match
};