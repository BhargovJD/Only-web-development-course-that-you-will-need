// conditional operators
// addition
function add(a, b) {
    return a + b;
}
console.log("Addition:",add(13, 5)); 

// subtraction
function subtract(a, b) {
    return a - b;
}
console.log("Subtraction:",subtract(13, 5)); 

// multiplication
function multiply(a, b) {
    return a * b;
}
console.log("Multiplication:",multiply(13, 5)); 

// division
function divide(a, b) {
    return a / b;
}
console.log("Division:",divide(13, 5)); 

// modulus
function modulus(a, b) {
    return a % b;
}
console.log("Modulus:",modulus(13, 5)); 

// exponentiation
function exponentiate(a, b) {
    return a ** b;
}
console.log("Exponentiation:",exponentiate(13, 5)); 

// Logical operators 
// logical AND
function logicalAnd(a, b) { 
    if(a && b) {
        return true;
    }
    return false;
}
// logical OR
function logicalOr(a, b) {
    if(a || b) {
        return true;
    }
    return false    ;
}
// logical NOT
function logicalNot(a) {
    if(!a) {
        return true;
    }   
    return false;
}

console.log(logicalNot(true)); // false
console.log(logicalNot(false)); // true