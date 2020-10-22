var http = require("http");

http.createServer(function(req, res) {
    if(req.url == '/test'){
        resd.end("error");
    }
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    
    res.end("Hello World");
}).listen(8080);