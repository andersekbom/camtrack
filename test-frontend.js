const puppeteer = require('puppeteer');

async function testFrontend() {
    console.log('🔍 Comprehensive frontend reload/flicker detection...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        
        // Track multiple types of events that indicate reloading
        let domLoadCount = 0;
        let navigationCount = 0;
        let renderCount = 0;
        let apiRequestCount = 0;
        let errorCount = 0;
        
        const startTime = Date.now();
        const events = [];
        
        // Monitor DOM content loaded events
        page.on('domcontentloaded', () => {
            domLoadCount++;
            const elapsed = Date.now() - startTime;
            events.push({ type: 'DOM_LOADED', time: elapsed, count: domLoadCount });
            console.log(`🔄 DOM loaded (#${domLoadCount}) at ${elapsed}ms`);
        });
        
        // Monitor navigation events
        page.on('framenavigated', () => {
            navigationCount++;
            const elapsed = Date.now() - startTime;
            events.push({ type: 'NAVIGATION', time: elapsed, count: navigationCount });
            console.log(`🧭 Navigation (#${navigationCount}) at ${elapsed}ms`);
        });
        
        // Monitor console messages for errors and React renders
        page.on('console', msg => {
            const elapsed = Date.now() - startTime;
            const text = msg.text();
            
            if (msg.type() === 'error') {
                errorCount++;
                events.push({ type: 'ERROR', time: elapsed, text });
                console.log(`❌ JS Error at ${elapsed}ms:`, text);
            } else if (text.includes('render') || text.includes('useEffect')) {
                renderCount++;
                events.push({ type: 'RENDER_LOG', time: elapsed, text });
                console.log(`⚛️  React activity at ${elapsed}ms:`, text);
            }
        });
        
        // Monitor network requests (especially API calls)
        page.on('response', response => {
            if (response.url().includes('/api/')) {
                apiRequestCount++;
                const elapsed = Date.now() - startTime;
                events.push({ 
                    type: 'API_REQUEST', 
                    time: elapsed, 
                    url: response.url(), 
                    status: response.status(),
                    count: apiRequestCount 
                });
                console.log(`🌐 API request (#${apiRequestCount}) at ${elapsed}ms: ${response.url()} [${response.status()}]`);
            }
        });
        
        // Try to connect to frontend
        const urls = ['http://localhost:5173', 'http://localhost:5174'];
        let connected = false;
        let currentUrl = '';
        
        for (const url of urls) {
            try {
                console.log(`🔗 Trying ${url}...`);
                await page.goto(url, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 10000 
                });
                console.log(`✅ Connected to ${url}`);
                connected = true;
                currentUrl = url;
                break;
            } catch (error) {
                console.log(`❌ ${url} not available:`, error.message);
            }
        }
        
        if (!connected) {
            console.log('❌ No frontend server found. Run ./start-dev.sh first');
            return;
        }
        
        // Wait for initial render
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get page info
        const title = await page.title();
        const heading = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
        
        console.log(`\n📄 Page Info:`);
        console.log(`   URL: ${currentUrl}`);
        console.log(`   Title: ${title}`);
        console.log(`   Heading: ${heading}`);
        
        // Monitor for activity for 20 seconds
        console.log(`\n⏱️  Monitoring for 20 seconds to detect patterns...`);
        await new Promise(resolve => setTimeout(resolve, 20000));
        
        // Analyze results
        console.log(`\n📊 Analysis Results:`);
        console.log(`   DOM loads: ${domLoadCount}`);
        console.log(`   Navigations: ${navigationCount}`);
        console.log(`   API requests: ${apiRequestCount}`);
        console.log(`   JS errors: ${errorCount}`);
        console.log(`   React activity: ${renderCount}`);
        
        // Check for problematic patterns
        const issues = [];
        
        if (domLoadCount > 2) {
            issues.push(`🚨 Multiple DOM loads (${domLoadCount}) - indicates page reloading`);
        }
        
        if (apiRequestCount > 10) {
            issues.push(`🚨 High API request count (${apiRequestCount}) - possible request loop`);
        }
        
        if (errorCount > 0) {
            issues.push(`❌ JavaScript errors detected (${errorCount})`);
        }
        
        // Check for rapid sequential events (flickering pattern)
        let rapidEvents = 0;
        for (let i = 1; i < events.length; i++) {
            if (events[i].time - events[i-1].time < 100) {
                rapidEvents++;
            }
        }
        
        if (rapidEvents > 5) {
            issues.push(`🚨 Rapid event sequence detected (${rapidEvents}) - indicates flickering`);
        }
        
        // Final assessment
        console.log(`\n🏁 Final Assessment:`);
        if (issues.length === 0) {
            console.log('✅ No major issues detected - frontend appears stable');
        } else {
            console.log('🚨 Issues detected:');
            issues.forEach(issue => console.log(`   ${issue}`));
            
            console.log(`\n💡 Possible causes:`);
            console.log(`   - useEffect with missing dependencies causing re-renders`);
            console.log(`   - State updates triggering immediate re-fetches`);
            console.log(`   - Component mounting/unmounting rapidly`);
            console.log(`   - Network request triggering state changes that cause more requests`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testFrontend();