const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config();

let client;
let isMock = false;

if (process.env.USE_MOCK_REDIS === 'true') {
    isMock = true;
} else {
    client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
}

// Mock implementation
const mockClient = {
    connect: async () => console.log('[Redis] Using in-memory mock'),
    on: (event, cb) => { },
    get: async (key) => { return mockClient.store[key] || null; },
    set: async (key, val) => { mockClient.store[key] = val; return 'OK'; },
    setEx: async (key, sec, val) => { mockClient.store[key] = val; return 'OK'; },
    del: async (key) => { delete mockClient.store[key]; return 1; },
    ping: async () => 'PONG',
    quit: async () => { },
    store: {}
};

if (isMock) {
    client = mockClient;
} else {
    client.on('error', (err) => {
        console.error('[Redis] Client Error', err.message);
        // If we haven't connected yet, maybe we should switch to mock?
        // But this event happens async.
    });
}

// Wrapper to handle connection failures gracefully
const wrappedClient = new Proxy(client || {}, {
    get: function (target, prop, receiver) {
        if (target[prop]) {
            return target[prop];
        }
        // If client is not connected or failed, allow fallback?
        // Simpler: just export the client, server.js handles errors.
        return undefined;
    }
});

// We need to export a client that works.
// If original client fails to connect, we can't easily swap it here without a wrapper.
// Let's rely on server.js to catch the connection error and maybe restart or log.
// But to make it "works out of the box":

if (!isMock) {
    // Overwrite connect to catch error and swap to mock
    const originalConnect = client.connect.bind(client);
    client.connect = async () => {
        try {
            await originalConnect();
        } catch (e) {
            console.warn('[Redis] Connection failed, switching to Mock');
            // Swap methods to mock
            Object.assign(client, mockClient);
            return client.connect();
        }
    };
}

module.exports = client || mockClient;
