const net = require('net');

const server = net.createServer((socket) => {
  socket.on('data',(data)=>{
    let request = data.toString();
    let [requestLine,...headerRows] = request.split('\r\n');
    let [method,path] = requestLine.split(' ');
    // 注意这里的-2，有一个空行，
    // age: 12\r\n
    // \r\n
    console.log('headerRows');
    console.log(headerRows);
    let headers = headerRows.slice(0,-2).reduce((memo,row)=>{
      let [key,value] = row.split(': ');
      memo[key] = value;
      return memo;
    },{});
    console.log('method',method);
    console.log('path',path);
    console.log('headers',headers);

    let rows = [];
    rows.push(`HTTP/1.1 200 OK`);
    rows.push(`Context-type: text-plain`);
    rows.push(`Date: ${new Date().toGMTString()}`);
    rows.push(`Connection: keep-alive`);
    rows.push(`Transfer-Encoding: chunked`);
    let responseBody = 'get';
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
