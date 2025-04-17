var posts=["2025/04/16/hello-world/","2025/04/18/测试/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };