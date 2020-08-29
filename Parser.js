/**
 * 使用状态机解析请求，获取请求行 请求头 请求体
 */

let LF = 10,//换行  line feed
    CR = 13,//回车 carriage return
    SPACE = 32,//空格
    COLON = 58;//冒号
let PARSER_UNINITIALIZED=0,//未解析
    START=1,//开始解析
    REQUEST_LINE=2,
    HEADER_FIELD_START=3,
    HEADER_FIELD=4,
    HEADER_VALUE_START=5,
    HEADER_VALUE=6,
    READING_BODY=7;

class Parser {
  constructor(){
    this.state = PARSER_UNINITIALIZED;
  }
  parse(buffer) {
    let self =this,
        requestLine='', // POST /post HTTP/1.1
        headers = {},
        body='',
        i=0,
        char,
        state = START, //开始解析
        headerField='',
        headerValue='';

    console.log(buffer.toString());
    for (i = 0; i < buffer.length; i++) {
      char = buffer[i];
      switch (state) {
        // 注意没有加break，会一直往下走
        case START:
          state = REQUEST_LINE;
          self['requestLineMark'] = i; // 记录请求行开始的索引
        case REQUEST_LINE:
          if (char === CR) { //换行
            requestLine=buffer.toString('utf8', self['requestLineMark'], i);
            break;
          } else if (char === LF){//回车
            state = HEADER_FIELD_START;
          }
          break;
        case HEADER_FIELD_START:
          if (char === CR) {
            state = READING_BODY;
            self['bodyMark'] = i+2;
            break;
          } else {
            state = HEADER_FIELD;
            self['headerFieldMark'] = i;
          }
        case HEADER_FIELD:
          if (char == COLON) {
            headerField=buffer.toString('utf8', self['headerFieldMark'], i);
            state = HEADER_VALUE_START;
          }
          break;
        case HEADER_VALUE_START:
          if (char == SPACE) {
            break;
          }
          self['headerValueMark'] = i;
          state = HEADER_VALUE;
        case HEADER_VALUE:
          if (char === CR) {
            headerValue = buffer.toString('utf8', self['headerValueMark'], i);
            headers[headerField] = headerValue;
            headerField = '';
            headerValue = '';
          } else if (char === LF){
            state = HEADER_FIELD_START;
          }
          break;
        default:
            break;
      }
    }
    let [method,url] =requestLine.split(' ');
    body = buffer.toString('utf8', self['bodyMark'], i);
    return { method, url, headers, body };
  }
}

module.exports = Parser

/**
POST /post HTTP/1.1
Host: 127.0.0.1:3001
Connection: keep-alive
Content-Length: 27
sec-ch-ua: "\\Not\"A;Brand";v="99", "Chromium";v="84", "Google Chrome";v="84"
sec-ch-ua-mobile: ?0
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36
Content-Type: application/json
Origin: http://127.0.0.1:3001
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: http://127.0.0.1:3001/post.html
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,fr;q=0.6

{"name":"newming","age":11}
 */