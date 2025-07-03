module.exports = {
  apps: [{
    name: "shopee-to-facebook",
    script: "python",
    args: "C:/shopee_to_facebook/shopee_to_facebook.py",
    interpreter: "",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
}