// typso.js

class Typso {
    static isStrict = true; // Enable/Disable strict mode
    static logWarnings = false; // Enable/Disable warnings instead of errors
  
    // Basic Type Checking
    static checkType(variable, type, customMessage = null) {
      if (typeof variable !== type) {
        const message = customMessage || `TypeError: Expected ${type} but received ${typeof variable}`;
        this._throwError(message);
      }
    }
  
    static checkInstance(variable, instance, customMessage = null) {
      if (!(variable instanceof instance)) {
        const message = customMessage || `TypeError: Expected instance of ${instance.name}`;
        this._throwError(message);
      }
    }
  
    // Array Type Checking
    static checkArray(variable, elementType, customMessage = null) {
      if (!Array.isArray(variable)) {
        this._throwError('TypeError: Expected an array');
      }
      variable.forEach((item) => this.checkType(item, elementType, customMessage));
    }
  
    // Union Type Checking (string | number)
    static checkUnion(variable, types, customMessage = null) {
      if (!types.includes(typeof variable)) {
        const message = customMessage || `TypeError: Expected one of [${types.join(", ")}] but received ${typeof variable}`;
        this._throwError(message);
      }
    }
  
    // Object Schema Validation
    static checkObject(variable, schema) {
      if (typeof variable !== 'object' || Array.isArray(variable)) {
        this._throwError('TypeError: Expected an object');
      }
      Object.keys(schema).forEach((key) => {
        const expectedType = schema[key];
        const value = variable[key];
        this._checkSchemaField(value, expectedType);
      });
    }
  
    // Advanced: Date, Boolean, Custom Validations
    static checkDate(variable) {
      if (!(variable instanceof Date)) {
        this._throwError('TypeError: Expected a Date');
      }
    }
  
    static checkBoolean(variable) {
      this.checkType(variable, 'boolean');
    }
  
    // Custom Validation
    static checkCustom(variable, validationFunc, customMessage = null) {
      if (!validationFunc(variable)) {
        const message = customMessage || 'ValidationError: Custom validation failed';
        this._throwError(message);
      }
    }
  
    // Check Not NaN
    static checkNotNaN(variable) {
      if (Number.isNaN(variable)) {
        this._throwError('TypeError: Value should not be NaN');
      }
    }
  
    // Helper for Strict Mode
    static enforceStrictMode(strict = true) {
      this.isStrict = strict;
    }
  
    // Helper for Logging Warnings
    static enableWarnings(enable = false) {
      this.logWarnings = enable;
    }
  
    // Private: Throw or Warn
    static _throwError(message) {
      if (this.logWarnings) {
        console.warn(message);
      } else {
        throw new Error(message);
      }
    }
  
    // Private: Check Field in Object Schema
    static _checkSchemaField(value, expectedType) {
      if (typeof expectedType === 'string') {
        this.checkType(value, expectedType);
      } else if (Array.isArray(expectedType) && expectedType[0] === 'array') {
        this.checkArray(value, expectedType[1]);
      } else if (typeof expectedType === 'function') {
        this.checkCustom(value, expectedType);
      } else {
        this.checkInstance(value, expectedType);
      }
    }
  }
  
  function enforceType(func, paramTypes, returnType) {
    return (...args) => {
      args.forEach((arg, index) => {
        const expectedType = paramTypes[index];
        if (typeof expectedType === 'string') {
          Typso.checkType(arg, expectedType);
        } else if (Array.isArray(expectedType) && expectedType[0] === 'array') {
          Typso.checkArray(arg, expectedType[1]);
        } else {
          Typso.checkInstance(arg, expectedType);
        }
      });
  
      const result = func(...args);
  
      if (returnType) {
        if (typeof returnType === 'string') {
          Typso.checkType(result, returnType);
        } else {
          Typso.checkInstance(result, returnType);
        }
      }
  
      return result;
    };
  }
  
  // React HOC for Prop Types Validation
  function withPropTypes(WrappedComponent, propTypes, defaultProps = {}) {
    return (props) => {
      Object.keys(propTypes).forEach((key) => {
        const expectedType = propTypes[key];
        const propValue = props[key] ?? defaultProps[key];
  
        if (propValue === undefined && expectedType !== 'optional') {
          Typso._throwError(`TypeError: Prop '${key}' is required but missing.`);
        }
  
        if (propValue != null) {
          Typso._checkSchemaField(propValue, expectedType);
        }
      });
  
      return <WrappedComponent {...props} />;
    };
  }
  
  // Validation Middleware for Express (Body/Query Params)
  function validateRequestBody(schema) {
    return (req, res, next) => {
      try {
        Typso.checkObject(req.body, schema);
        next();
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    };
  }
  
  // Utility to check ranges and lengths (for numbers and arrays)
  Typso.checkRange = (value, min, max) => {
    if (value < min || value > max) {
      Typso._throwError(`RangeError: Value should be between ${min} and ${max}`);
    }
  };
  
  Typso.checkLength = (value, minLength, maxLength) => {
    if (value.length < minLength || value.length > maxLength) {
      Typso._throwError(`LengthError: Length should be between ${minLength} and ${maxLength}`);
    }
  };
  
  // Helper to Normalize Data
  function normalize(schema, data) {
    Object.keys(schema).forEach((key) => {
      const defaultValue = schema[key].default;
      if (data[key] === undefined && defaultValue !== undefined) {
        data[key] = defaultValue;
      }
    });
    return data;
  }
  
  module.exports = {
    Typso,
    enforceType,
    withPropTypes,
    validateRequestBody,
    normalize,
  };  