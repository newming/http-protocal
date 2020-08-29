const net = require('net');
let Parser = require('./Parser')

const server = net.createServer((socket) => {
  socket.on('data',(data)=>{
    let parser = new Parser()
    let {method, url, headers, body} = parser.parse(data)

    console.log('method',method);
    console.log('url',url);
    console.log('headers',headers);
    console.log('body',body);

    let rows = [];
    rows.push(`HTTP/1.1 200 OK`);
    rows.push(`Context-type: text-plain`);
    rows.push(`Date: ${new Date().toGMTString()}`);
    rows.push(`Connection: keep-alive`);
    rows.push(`Transfer-Encoding: chunked`);
    let responseBody = body;
    rows.push(`Content-length: ${Buffer.byteLength(responseBody)}`);
    rows.push(`\r\n${Buffer.byteLength(responseBody).toString(16)}\r\n${responseBody}\r\n0`);
    let response = rows.join('\r\n');
    console.log('response')
    console.log(response)
    socket.end(response);
  });
})
server.on('error', (err) => {
  console.error(err);
});

server.listen(3001,() => {
  console.log('服务器已经启动', server.address());
});
