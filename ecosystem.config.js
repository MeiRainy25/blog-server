module.exports = {
  apps: [
    {
      name: 'blog-server',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env',
    },
  ],
};
