import fetch from 'node-fetch';

async function testAPI(): Promise<void> {
  try {
    const response = await fetch('http://localhost:3000/api/chat-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message'
          }
        ]
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const text = await response.text();
    console.log('Response body:', text);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI(); 