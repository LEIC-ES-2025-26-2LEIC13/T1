const originalError = console.error; console.error = (...args) => { if (args[0] && typeof args[0] === 'string' && args[0].includes('was not wrapped in act')) return; originalError(...args); };
