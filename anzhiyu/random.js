var posts=["2025/04/16/hello-world/","2025/04/18/reak/","2025/04/18/sqz/","2025/04/18/gbjd/","2025/04/19/hello-dev-world/","2025/04/19/mtspark/","2025/04/19/funvsc/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };