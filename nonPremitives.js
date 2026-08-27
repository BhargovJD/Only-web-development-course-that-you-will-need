// non premitives are objects, arrays, functions, dates, regex, etc.
// objects 
let obj = {
    name: "John",
    age: 30,
    city: "New York",
    "home address": "123 Main St",

};

obj.newProperty = "This is a new property";

console.log("Object:", obj);
console.log("Name:", obj.name);
console.log("New Property:", obj.newProperty);
console.log("Home Address:", obj["home address"]);

// Arrays
let arr = [1, 2, 3, 4, 5];
arr.push(6);
console.log("Array:", arr);
console.log("First Element:", arr[0]);
console.log("Last Element:", arr[arr.length - 1]);
