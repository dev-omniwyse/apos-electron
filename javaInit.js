// "use strict";
// var fs = require("fs");
// var java = require("java");
// var baseDir = "javaSmartCard/src/com/genfare/smartcard";
// var dependencies = fs.readdirSync(baseDir);
 
// dependencies.forEach(function(dependency){
//     java.classpath.push(baseDir + "/" + dependency);
// })
 
// java.classpath.push("javaSmartCard/src/com/genfare/smartcard");
// // java.classpath.push("./target/test-classes");
 
// exports.getJavaInstance = function() {
//     return java;
// }
"use strict";
var fs = require("fs");
var java = require("java");
var path = require("path")
var baseDir = path.join(__dirname ,"javajars");
// var baseDir1 = path.join(__dirname ,"posapplet","src" ,"com" ,"genfare", "posapplet");
var dependencies = fs.readdirSync(baseDir);
// var dependencies1 = fs.readdirSync(baseDir1);

dependencies.forEach(function(dependency){
    java.classpath.push(baseDir + "/" + dependency);
})
// dependencies1.forEach(function(dependency){
//     java.classpath.push(baseDir + "/" + dependency);
// })
// java.classpath.push("javajars/src/com/genfare/applet/encoder");
// java.classpath.push("./target/test-classes");
java.classpath.push("./");
exports.getJavaInstance = function() {
    return java;
}