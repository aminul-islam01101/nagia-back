module.exports = {
  apps: [
    {
      name: 'nagai_backend_prod',
      script: 'npm',
      args: 'start',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
