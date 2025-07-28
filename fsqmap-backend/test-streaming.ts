import fetch from 'node-fetch';

async function testStreamingAPI(): Promise<void> {
  try {
    console.log('Testing streaming API...');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Hello, can you tell me a short story?'
          }
        ],
        location: {
          latitude: 37.7749,
          longitude: -122.4194
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    // Check if it's a streaming response
    const contentType = response.headers.get('content-type');
    const isStreaming = response.headers.get('x-vercel-ai-data-stream');
    
    console.log('Content-Type:', contentType);
    console.log('Is streaming response:', isStreaming);
    
    if (isStreaming) {
      console.log('✅ Streaming response detected!');
      
      // Read the streaming response
      const reader = (response.body as any)?.getReader();
      if (!reader) {
        console.error('No readable stream available');
        return;
      }
      
      const decoder = new TextDecoder();
      
      console.log('Reading streaming response...');
      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream completed');
          break;
        }
        
        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk);
        fullText += chunk;
      }
      
      console.log('Full response:', fullText);
    } else {
      console.log('❌ Not a streaming response');
      const text = await response.text();
      console.log('Response body:', text);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testStreamingAPI(); 