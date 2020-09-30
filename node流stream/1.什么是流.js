// 这里所谓的流,或者是stream，指的是node里面的stream模块提供的接口
var Stream = requrie('stream');
var Readable = Stream.Readable; // 可读流
var Writable = Stream.Writable; // 可写流
var Transform = Stream.Transform; // 转化流
var Duplex = Stream.Duplex; // 双工流

// fs.readFile读取文件，需要一次性的将文件的所有内容都读到内存中去,开销较大

// 其实流的主要作用是为了将数据转化为字节序，再按照自己的方式转化，传输的时候可以自定义传输的大小和速度,又可以控制
// 传输中的处理，所以流应该是相对应是对数据的处理和加工，任何对数据的操作都可以用流的思想去解决....



