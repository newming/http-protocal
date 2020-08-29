let net = require('net') // 属于传输层

const ReadyState = {
  UNSENT: 0,//（代理被创建，但尚未调用 open() 方法。
  OPENED: 1,//open() 方法已经被调用
  HEADERS_RECEIVED: 2,//send() 方法已经被调用，并且头部和状态已经可获得。
  LOADING: 3,//（交互）正在解析响应内容
  DONE: 4 //（完成）响应内容解析完成，可以在客户端调用了
}

// 模拟客户端发请求
class XMLHttpRequest {
  constructor() {
    this.readyState = ReadyState.UNSENT
    this.headers = {
      'Connection': 'keep-alive'
    }
  }

  open(method, url) {
    this.method = method || 'GET'
    this.url = url
    let { hostname, port, path } = require('url').parse(url)
    this.hostname = hostname
    this.port = port
    this.path = path
    this.headers['Host'] = `${hostname}:${port}`

    // 通过传输层的net模块发起请求
    const socket = this.socket = net.createConnection({
      hostname,
      port
    }, () => {
      // 连接成功之后课件监听服务端的数据
      socket.on('data', (data) => {
        data = data.toString()
        console.log('data ======== start')
        console.log(data)
        console.log('data ======== end')
        // 响应头和响应体
        let [response, bodyRows] = data.split('\r\n\r\n')
        let [statusLine, ...headerRows] = response.split('\r\n')
        let [, status, statusText] = statusLine.split(' ')
        this.status = status
        this.statusText = statusText
        this.responseHeaders = headerRows.reduce((memo, row) => {
          let [key, value] = row.split(': ')
          memo[key] = value
          return memo
        }, {})
        this.readyState = ReadyState.HEADERS_RECEIVED
        xhr.onreadystatechange && xhr.onreadystatechange()
        this.readyState = ReadyState.LOADING
        xhr.onreadystatechange && xhr.onreadystatechange()
        // 下边是一个响应体的格式，第一个数字表示响应的长度，\r\n表示换行，接下来是响应内容，最后的0表示响应结束
        // 3\r\nget\r\n0
        let [, body,] = bodyRows.split('\r\n')
        this.response = this.responseText = body
        this.readyState = ReadyState.DONE
        xhr.onreadystatechange && xhr.onreadystatechange()
        this.onload && this.onload()
      })
      socket.on('error', (err) => {
        this.onerror && this.onerror(err)
      })
      this.readyState = ReadyState.OPENED
      xhr.onreadystatechange && xhr.onreadystatechange()
    })
  }

  getAllResponseHeaders() {
    let allResponseHeaders = '';
    for (let key in this.responseHeaders) {
      allResponseHeaders += `${key}: ${this.responseHeaders[key]}\r\n`;
    }
    return allResponseHeaders;
  }

  setRequestHeader(header, value) {
    this.headers[header] = value
  }

  send() {
    let rows = []
    rows.push(`${this.method} ${this.path} HTTP/1.1`)
    // 设置请求头
    rows.push(...Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`))
    let request = rows.join('\r\n') + '\r\n\r\n' // 注意这里拼接的两个换行符，缺一个都不行，一个是最后一个header的结尾，一个是空行，用了分隔请求体
    console.log('request', request)
    this.socket.write(request)
  }
}

let xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
  console.log('onreadystatechange', xhr.readyState);
}
xhr.open("GET", "http://127.0.0.1:3001/get");
xhr.responseType = "text";
xhr.setRequestHeader('name', 'zhufeng');
xhr.setRequestHeader('age', '10');
xhr.onload = () => {
  console.log('readyState', xhr.readyState);
  console.log('status', xhr.status);
  console.log('statusText', xhr.statusText);
  console.log('getAllResponseHeaders', xhr.getAllResponseHeaders());
  console.log('response', xhr.response);
};
xhr.send();
