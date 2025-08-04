import { searchRedfinProperty, extractPropertyInfo, toMarkdown, toJson } from '../src/app/lib/redfinTool';

/**
 * Example: Search for a property and get information in markdown format
 */
async function exampleMarkdownOutput() {
  console.log('=== Example: Markdown Output ===');
  
  const address = '4440 S Oleander Dr, Chandler, AZ';
  console.log(`Searching for: ${address}`);
  
  try {
    const html = await searchRedfinProperty(address);
    
    if (!html) {
      console.log('❌ No property found or access blocked');
      return;
    }
    
    const propertyInfo = extractPropertyInfo(html);
    const markdown = toMarkdown(propertyInfo);
    
    console.log('\n📋 Property Information (Markdown):');
    console.log(markdown);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example: Search for a property and get information in JSON format
 */
async function exampleJsonOutput() {
  console.log('\n=== Example: JSON Output ===');
  
  const address = '4440 S Oleander Dr, Chandler, AZ';
  console.log(`Searching for: ${address}`);
  
  try {
    const html = await searchRedfinProperty(address);
    
    if (!html) {
      console.log('❌ No property found or access blocked');
      return;
    }
    
    const propertyInfo = extractPropertyInfo(html);
    const json = toJson(propertyInfo);
    
    console.log('\n📋 Property Information (JSON):');
    console.log(json);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example: Extract specific property details
 */
async function exampleSpecificDetails() {
  console.log('\n=== Example: Specific Details ===');
  
  const address = '4440 S Oleander Dr, Chandler, AZ';
  console.log(`Searching for: ${address}`);
  
  try {
    const html = await searchRedfinProperty(address);
    
    if (!html) {
      console.log('❌ No property found or access blocked');
      return;
    }
    
    const propertyInfo = extractPropertyInfo(html);
    
    console.log('\n🏠 Property Details:');
    console.log(`Address: ${propertyInfo.address || 'Not found'}`);
    console.log(`Price: ${propertyInfo.price || 'Not found'}`);
    console.log(`Bedrooms: ${propertyInfo.beds || 'Not found'}`);
    console.log(`Bathrooms: ${propertyInfo.baths || 'Not found'}`);
    console.log(`Square Feet: ${propertyInfo.sqft || 'Not found'}`);
    console.log(`Year Built: ${propertyInfo.yearBuilt || 'Not found'}`);
    console.log(`Property Type: ${propertyInfo.propertyType || 'Not found'}`);
    console.log(`Status: ${propertyInfo.status || 'Not found'}`);
    
    if (propertyInfo.features && propertyInfo.features.length > 0) {
      console.log(`\nFeatures (${propertyInfo.features.length}):`);
      propertyInfo.features.forEach((feature, index) => {
        console.log(`  ${index + 1}. ${feature}`);
      });
    }
    
    if (propertyInfo.images && propertyInfo.images.length > 0) {
      console.log(`\nImages (${propertyInfo.images.length}):`);
      propertyInfo.images.slice(0, 3).forEach((image, index) => {
        console.log(`  ${index + 1}. ${image}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example: Handle errors gracefully
 */
async function exampleErrorHandling() {
  console.log('\n=== Example: Error Handling ===');
  
  const addresses = [
    '4440 S Oleander Dr, Chandler, AZ',
    'Invalid Address, Nowhere, ZZ',
    '123 Main St, Phoenix, AZ'
  ];
  
  for (const address of addresses) {
    console.log(`\nTrying address: ${address}`);
    
    try {
      const html = await searchRedfinProperty(address);
      
      if (!html) {
        console.log('❌ No property found or access blocked');
        continue;
      }
      
      if (html.includes('403 ERROR') || html.includes('Request blocked')) {
        console.log('❌ Access blocked by Redfin');
        continue;
      }
      
      const propertyInfo = extractPropertyInfo(html);
      
      if (!propertyInfo.address) {
        console.log('❌ No address found in results');
        continue;
      }
      
      console.log(`✅ Found: ${propertyInfo.address}`);
      console.log(`   Price: ${propertyInfo.price || 'Not available'}`);
      
    } catch (error) {
      console.error(`❌ Error for ${address}:`, error.message);
    }
  }
}

// Run all examples
async function runExamples() {
  console.log('🚀 Running Redfin Tool Examples\n');
  
  await exampleMarkdownOutput();
  await exampleJsonOutput();
  await exampleSpecificDetails();
  await exampleErrorHandling();
  
  console.log('\n✅ All examples completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export { 
  exampleMarkdownOutput, 
  exampleJsonOutput, 
  exampleSpecificDetails, 
  exampleErrorHandling,
  runExamples 
}; 