const http = require('http');

console.log('🔍 Monitoring API requests to detect reload loops...');
console.log('📡 Watching http://localhost:3000/api/cameras');
console.log('⏱️  Will monitor for 30 seconds...\n');

let requestCount = 0;
let requestTimes = [];
const startTime = Date.now();

function makeRequest() {
    const reqStart = Date.now();
    requestCount++;
    
    const req = http.get('http://localhost:3000/api/cameras', (res) => {
        const reqEnd = Date.now();
        const elapsed = reqEnd - startTime;
        const duration = reqEnd - reqStart;
        
        requestTimes.push(elapsed);
        
        console.log(`🔄 Request #${requestCount} at ${(elapsed/1000).toFixed(1)}s (${duration}ms response)`);
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const cameras = JSON.parse(data);
                console.log(`   📊 Response: ${cameras.length} cameras, ${data.length} bytes`);
            } catch (e) {
                console.log(`   ❌ Invalid JSON response: ${data.substring(0, 50)}...`);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log(`❌ Request #${requestCount} failed: ${error.message}`);
    });
    
    req.setTimeout(5000, () => {
        console.log(`⏱️  Request #${requestCount} timed out`);
        req.abort();
    });
}

// Monitor for rapid requests by making requests every 100ms
const interval = setInterval(makeRequest, 100);

// Stop after 30 seconds and analyze
setTimeout(() => {
    clearInterval(interval);
    
    console.log('\n📋 Analysis Results:');
    console.log(`   Total requests made: ${requestCount}`);
    console.log(`   Duration: 30 seconds`);
    console.log(`   Average rate: ${(requestCount/30).toFixed(1)} requests/second`);
    
    if (requestCount > 60) {
        console.log('🚨 HIGH REQUEST RATE - Possible reload loop!');
        console.log('💡 The frontend might be making too many API calls');
    } else if (requestCount > 30) {
        console.log('⚠️  Moderate request rate - may indicate frequent re-renders');
    } else {
        console.log('✅ Normal request rate');
    }
    
    // Check for request clustering (signs of rapid reloads)
    if (requestTimes.length > 1) {
        let clusters = 0;
        for (let i = 1; i < requestTimes.length; i++) {
            if (requestTimes[i] - requestTimes[i-1] < 200) { // requests within 200ms
                clusters++;
            }
        }
        
        if (clusters > requestCount * 0.3) {
            console.log(`🚨 CLUSTERING DETECTED: ${clusters} rapid request pairs found`);
            console.log('💡 This suggests React components are re-rendering rapidly');
        }
    }
    
    process.exit(0);
}, 30000);