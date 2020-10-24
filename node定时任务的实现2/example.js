const Bree = require("bree");
const path = require('path');
const bree = new Bree({
    jobs:[
        {
            name:"test",
            interval:'1s',
        }
    ]
})
bree.start();