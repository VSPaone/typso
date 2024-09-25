# **Typso Documentation**

Welcome to the **Typso** library, a comprehensive type-checking solution designed to provide robust runtime validation for JavaScript/Node.js environments, React, Express, and beyond. With Typso, you can enforce strict type checks on your functions, objects, and React components while maintaining flexibility for more dynamic and asynchronous use cases.

## **Overview**

Typso enables:
- Runtime type-checking for variables, function arguments, return types, and object schemas.
- Integration with React for prop validation.
- Middleware for Express to validate request bodies and query parameters.
- Support for complex types like arrays, objects, and unions.
- Optional features like strict/loose modes, async validations, schema normalization, and lifecycle hooks.

### **Installation**

Install Typso using npm:

```bash
npm install typso
```

---

## **Core Features**

### 1. **Basic Type Checking**
Typso can enforce basic type checks for primitive types such as `string`, `number`, `boolean`, and more.

#### Usage:

```javascript
const { TypeChecker } = require('typso');

TypeChecker.checkType('Hello', 'string');  // Passes
TypeChecker.checkType(123, 'string');      // Throws TypeError: Expected string but received number
```

Supported Types:
- `string`
- `number`
- `boolean`
- `function`
- `object`

### 2. **Instance Checking**
You can check if a variable is an instance of a particular class.

#### Usage:

```javascript
const { TypeChecker } = require('typso');

class MyClass {}
const instance = new MyClass();

TypeChecker.checkInstance(instance, MyClass);  // Passes
TypeChecker.checkInstance({}, MyClass);        // Throws TypeError: Expected instance of MyClass
```

### 3. **Array Type Checking**
Typso can check the type of elements inside an array.

#### Usage:

```javascript
const { TypeChecker } = require('typso');

const myArray = [1, 2, 3];
TypeChecker.checkArray(myArray, 'number');  // Passes

const invalidArray = [1, '2', 3];
TypeChecker.checkArray(invalidArray, 'number');  // Throws TypeError
```

### 4. **Union Type Checking**
For scenarios where variables can belong to multiple types, you can enforce union type checking.

#### Usage:

```javascript
const { TypeChecker } = require('typso');

TypeChecker.checkUnion(42, ['string', 'number']);  // Passes
TypeChecker.checkUnion(true, ['string', 'number']); // Throws TypeError
```

### 5. **Object Schema Validation**
Typso provides a mechanism to define a schema for objects and enforce type checks on each property of the object.

#### Usage:

```javascript
const { TypeChecker } = require('typso');

const userSchema = {
  name: 'string',
  age: 'number',
  hobbies: ['array', 'string'],
};

const user = {
  name: 'Alice',
  age: 25,
  hobbies: ['Reading', 'Coding']
};

TypeChecker.checkObject(user, userSchema);  // Passes
```

---

## **Advanced Features**

### 6. **Range and Length Validation**
You can enforce numeric ranges or string/array lengths.

#### Range Validation:
```javascript
TypeChecker.checkRange(50, 10, 100);  // Passes
TypeChecker.checkRange(150, 10, 100); // Throws RangeError: Value should be between 10 and 100
```

#### Length Validation:
```javascript
TypeChecker.checkLength('hello', 1, 10);  // Passes
TypeChecker.checkLength('too long string', 1, 10); // Throws LengthError
```

### 7. **Custom Validations**
Typso allows you to create custom validations using functions.

#### Usage:

```javascript
const validColors = ['red', 'green', 'blue'];

TypeChecker.checkCustom('green', (value) => validColors.includes(value));  // Passes
TypeChecker.checkCustom('yellow', (value) => validColors.includes(value));  // Throws ValidationError
```

### 8. **Default Values and Normalization**
You can provide default values when some object properties are missing and normalize them.

#### Usage:

```javascript
const { normalize } = require('typso');

const userSchema = {
  name: { type: 'string', default: 'Anonymous' },
  age: { type: 'number', default: 18 },
};

const user = {
  email: 'user@example.com'
};

const normalizedUser = normalize(userSchema, user);
console.log(normalizedUser);  // { name: 'Anonymous', age: 18, email: 'user@example.com' }
```

### 9. **Asynchronous Validations**
Typso supports async validations, which is useful for tasks like checking if a value exists in a database.

#### Usage:

```javascript
const { TypeChecker } = require('typso');

async function isUsernameAvailable(username) {
  const availableUsernames = ['john', 'jane', 'doe'];
  return availableUsernames.includes(username);
}

async function validateUsername(username) {
  await TypeChecker.checkAsync(username, isUsernameAvailable);  // Passes or throws error
}

validateUsername('john');  // Passes
validateUsername('nonexistent');  // Throws ValidationError
```

### 10. **Strict vs. Loose Mode**
Typso can operate in strict mode (more rigorous checks) or loose mode (allows `null` or `undefined` values in some cases).

#### Usage:

```javascript
TypeChecker.enforceStrictMode(true);  // Enable strict mode
TypeChecker.checkType(null, 'string');  // Throws error in strict mode
TypeChecker.enforceStrictMode(false);  // Loose mode allows null values
```

### 11. **Declarative Schema Validation**
You can define schemas with rules for validation, such as minimum length, maximum length, and patterns.

#### Usage:

```javascript
const schema = {
  name: { type: 'string', minLength: 2, maxLength: 50 },
  age: { type: 'number', min: 18, max: 100 },
  email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },  // Email regex
};

TypeChecker.validateDeclarativeSchema(user, schema);
```

### 12. **Lifecycle Hooks**
Typso supports lifecycle hooks like `beforeValidate` and `afterValidate`.

#### Usage:

```javascript
const schemaWithHooks = {
  name: 'string',
  beforeValidate: () => console.log('Starting validation...'),
  afterValidate: () => console.log('Validation complete!'),
};

TypeChecker.validateWithLifecycle(user, schemaWithHooks);
```

---

## **Integration with React**

### **Prop Types Validation**

Typso integrates seamlessly with React components for prop validation using higher-order components (HOCs).

#### Usage:

```javascript
import { withPropTypes } from 'typso';

const Greeting = ({ name, age }) => (
  <div>
    <h1>Hello, {name}!</h1>
    <p>Age: {age}</p>
  </div>
);

const GreetingWithTypes = withPropTypes(Greeting, {
  name: 'string',
  age: 'number',
});

export default GreetingWithTypes;
```

---

## **Integration with Express**

### **Express Middleware for Request Validation**

Typso provides middleware for validating request bodies or query parameters in Express.

#### Usage:

```javascript
const express = require('express');
const { validateRequestBody } = require('typso');

const app = express();
app.use(express.json());

const userSchema = {
  name: 'string',
  age: 'number',
  email: 'string',
};

app.post('/user', validateRequestBody(userSchema), (req, res) => {
  res.json({ success: true });
});

app.listen(3000);
```

---

## **Utility Functions**

### **checkRange**
Check if a number falls within a given range.

#### Syntax:
```javascript
TypeChecker.checkRange(value, min, max);
```

### **checkLength**
Check the length of strings or arrays.

#### Syntax:
```javascript
TypeChecker.checkLength(value, minLength, maxLength);
```

### **checkCustom**
Perform custom validations using a function.

#### Syntax:
```javascript
TypeChecker.checkCustom(value, validationFunction);
```

### **checkAsync**
Perform asynchronous validations.

#### Syntax:
```javascript
TypeChecker.checkAsync(value, asyncValidationFunction);
```

### **normalize**
Automatically fill missing fields in objects with default values as defined in the schema.

#### Syntax:
```javascript
normalize(schema, object);
```

---

## **Configuration**

### **Strict Mode**
Toggle strict or loose mode for type validation.

#### Syntax:
```javascript
TypeChecker.enforceStrictMode(true);  // Enable strict mode
TypeChecker.enforceStrictMode(false); // Enable loose mode
```

### **Logging Warnings**
Enable or disable logging warnings instead of throwing errors.

#### Syntax:
```javascript
TypeChecker.enableWarnings(true);  // Enable warnings
TypeChecker.enableWarnings(false); // Disable warnings
```

---

## **Conclusion**

Typso is a versatile and powerful type-checking library for JavaScript that works across various environments. It’s designed to be flexible, easy to integrate, and capable of handling simple to complex type validations, including async validations, schema normalization, and lifecycle hooks.

With Typso, you can enforce strong runtime validation and ensure that your data structures, function arguments, and component props adhere to expected types, making your applications more robust and reliable.
