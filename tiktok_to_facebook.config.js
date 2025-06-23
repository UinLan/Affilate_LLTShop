module.exports = {
  apps: [{
    name: "tiktok-to-facebook",
    script: "python",
    args: "C:/tiktok_to_facebook/tiktok_to_facebook.py",
    interpreter: "",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
}