module.exports = {
  apps: [
    {
      name: 'foodshare-api',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '300M',
      error_file: '/home/ubuntu/.pm2/logs/foodshare-api-error.log',
      out_file: '/home/ubuntu/.pm2/logs/foodshare-api-out.log',
    },
  ],
};
