module.exports = {
  apps: [
    {
      name: 'nagai_backend',
      script: 'npm',
      args: 'start',
      env_production: {
        NODE_ENV: 'staging',
      },
    },
  ],
};
