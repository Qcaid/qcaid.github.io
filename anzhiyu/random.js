var posts=["2025/04/16/hello-world/","2025/04/18/reak/","2025/04/18/sqz/","2025/04/18/gbjd/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };