self.addEventListener('message', (event) => {
  console.log('Worker received message:', event.data);
  if (event.data === 'start') {
    setInterval(() => {
      self.postMessage('keepAlive');
      console.log('Worker sent keepAlive message');
    }, 5 * 60 * 1000); // 5 minutes
  }
});
