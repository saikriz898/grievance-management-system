const { exec } = require('child_process');

const killPort = (port) => {
  const command = process.platform === 'win32' 
    ? `netstat -ano | findstr :${port}` 
    : `lsof -ti:${port}`;
    
  exec(command, (error, stdout) => {
    if (error) {
      console.log(`No process found on port ${port}`);
      return;
    }
    
    if (process.platform === 'win32') {
      const lines = stdout.split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            exec(`taskkill /PID ${pid} /F`, (killError) => {
              if (!killError) {
                console.log(`Killed process ${pid} on port ${port}`);
              }
            });
          }
        }
      });
    } else {
      const pids = stdout.trim().split('\n');
      pids.forEach(pid => {
        if (pid) {
          exec(`kill -9 ${pid}`, (killError) => {
            if (!killError) {
              console.log(`Killed process ${pid} on port ${port}`);
            }
          });
        }
      });
    }
  });
};

// Kill port 5000 if provided as argument
const port = process.argv[2] || 5000;
killPort(port);