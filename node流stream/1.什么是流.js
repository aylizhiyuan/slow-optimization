// 这里所谓的流,或者是stream，指的是node里面的stream模块提供的接口
var Stream = requrie('stream');
var Readable = Stream.Readable; // 可读流
var Writable = Stream.Writable; // 可写流
var Transform = Stream.Transform; // 转化流
var Duplex = Stream.Duplex; // 双工流

// fs.readFile读取文件，需要一次性的将文件的所有内容都读到内存中去,开销较大


