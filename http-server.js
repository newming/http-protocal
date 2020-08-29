const http = require('http') // 应用层
const fs = require('fs')
const path = require('path')
const url = require('url')

let server = http.createServer(function (req, res) {
  console.log(req.url)
  let { pathname } = url.parse(req.url)
  console.log(pathname)
  if (['/get.html', '/post.html'].includes(pathname)) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    let content = fs.readFileSync(path.join(__dirname, 'static', req.url.slice(1)))
    res.write(content)
    res.end()
  } else if (pathname === '/get') {
    console.log(req.url)
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.write('get')
    res.end()
  } else if (req.url === '/post'){
    let buffers = [];
    // on data 得到的只有请求体
    req.on('data',(data)=>{
      buffers.push(data);
    });
    req.on('end',()=>{
      console.log('method',req.method);
      console.log('url',req.url);
      console.log('headers',req.headers);
      let body = Buffer.concat(buffers);
      console.log('body', body.toString());
      res.statusCode = 200;
      res.setHeader('Context-type',"text-plain");
      res.write(body);
      res.end();
    });
  } else {
    res.statusCode = 404
    res.end()
  }
})

server.listen(3001, function () {
  console.log('server listen 3001')
})
