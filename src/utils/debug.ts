// Debug utility to ensure logs are working
const debug = {
  log: (...args: any[]) => {
    // Force log to appear as error to ensure visibility
    console.error('%c[DEBUG-LOG]', 'color: blue; font-weight: bold', new Date().toISOString(), ...args);
  },
  warn: (...args: any[]) => {
    console.error('%c[DEBUG-WARN]', 'color: orange; font-weight: bold', new Date().toISOString(), ...args);
  },
  error: (...args: any[]) => {
    console.error('%c[DEBUG-ERROR]', 'color: red; font-weight: bold', new Date().toISOString(), ...args);
  }
};

// Force immediate logging on module load
console.error('%c[DEBUG-INIT]', 'color: green; font-weight: bold', 'Debug module initialized at', new Date().toISOString());

export default debug; 