// Primitive Data Types in JavaScript
// 1. Number: Represents numeric values, both integers and floating-point numbers.
let age = 25; // integer
let price = 19.99; // floating-point number
console.log("Type:", typeof age);
let anotherPrice =new Number(19.99); // using the Number constructor
console.log("Type:", typeof anotherPrice); // object (not a primitive)



// 2. String: Represents a sequence of characters enclosed in single or double quotes.
let name = "John Doe";
let lastName = 'Smith';
let fullName = `Full Name: ${name} ${lastName}`; // using template literals
let number = `${5+7}`
console.log(fullName, number); // Output: Full Name: John Doe Smith {5+7}

// 3. Boolean: Represents a logical value that can be either true or false.
let isStudent = true;

// 4. Undefined: Represents a variable that has been declared but has not been assigned a value.
let x;

// 5. Null: Represents the intentional absence of any object value.
let y = null;
