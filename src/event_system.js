// BOTA - Event System
// Centralized event management for decoupled communication
// Handles game events, UI events, and system events

const EventSystem = {
    // Event listeners storage
    listeners: new Map(),
    
    // Event queue for deferred events
    eventQueue: [],
    
    // Event processing
    processing: false,
    
    // Event statistics
    stats: {
        totalEvents: 0,
        eventsPerType: new Map(),
        listenersPerType: new Map()
    },
    
    /**
     * Initialize event system
     */
    init() {
        this.listeners.clear();
        this.eventQueue = [];
        this.processing = false;
        this.stats.totalEvents = 0;
        this.stats.eventsPerType.clear();
        this.stats.listenersPerType.clear();
        
        console.log('EventSystem initialized');
    },
    
    /**
     * Add event listener
     * @param {string} eventType - Event type
     * @param {Function} callback - Event callback function
     * @param {Object} context - Context object (optional)
     * @param {number} priority - Priority (higher = first, default: 0)
     * @returns {Function} Unsubscribe function
     */
    on(eventType, callback, context = null, priority = 0) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        
        const listener = {
            callback,
            context,
            priority,
            id: Math.random().toString(36).substr(2, 9)
        };
        
        const listeners = this.listeners.get(eventType);
        listeners.push(listener);
        
        // Sort by priority (higher priority first)
        listeners.sort((a, b) => b.priority - a.priority);
        
        // Update stats
        this.stats.listenersPerType.set(eventType, (this.stats.listenersPerType.get(eventType) || 0) + 1);
        
        // Return unsubscribe function
        return () => this.off(eventType, listener.id);
    },
    
    /**
     * Remove event listener
     * @param {string} eventType - Event type
     * @param {string} listenerId - Listener ID
     */
    off(eventType, listenerId) {
        if (!this.listeners.has(eventType)) return;
        
        const listeners = this.listeners.get(eventType);
        const index = listeners.findIndex(l => l.id === listenerId);
        
        if (index >= 0) {
            listeners.splice(index, 1);
            
            // Update stats
            const count = this.stats.listenersPerType.get(eventType) || 0;
            this.stats.listenersPerType.set(eventType, Math.max(0, count - 1));
        }
    },
    
    /**
     * Add one-time event listener
     * @param {string} eventType - Event type
     * @param {Function} callback - Event callback function
     * @param {Object} context - Context object (optional)
     * @param {number} priority - Priority (higher = first, default: 0)
     * @returns {Function} Unsubscribe function
     */
    once(eventType, callback, context = null, priority = 0) {
        const unsubscribe = this.on(eventType, (eventData) => {
            callback.call(context, eventData);
            unsubscribe();
        }, context, priority);
        
        return unsubscribe;
    },
    
    /**
     * Emit event immediately
     * @param {string} eventType - Event type
     * @param {*} eventData - Event data
     * @param {boolean} stopPropagation - Whether to stop propagation after first handler
     * @returns {boolean} Whether event was handled
     */
    emit(eventType, eventData = null, stopPropagation = false) {
        if (!this.listeners.has(eventType)) {
            return false;
        }
        
        const listeners = this.listeners.get(eventType);
        let handled = false;
        
        // Update stats
        this.stats.totalEvents++;
        this.stats.eventsPerType.set(eventType, (this.stats.eventsPerType.get(eventType) || 0) + 1);
        
        // Create event object
        const event = {
            type: eventType,
            data: eventData,
            timestamp: Date.now(),
            stopPropagation: () => { stopPropagation = true; }
        };
        
        // Call listeners
        for (const listener of listeners) {
            try {
                listener.callback.call(listener.context, event);
                handled = true;
                
                if (stopPropagation) break;
            } catch (error) {
                console.error(`Error in event listener for ${eventType}:`, error);
            }
        }
        
        return handled;
    },
    
    /**
     * Queue event for later processing
     * @param {string} eventType - Event type
     * @param {*} eventData - Event data
     * @param {number} delay - Delay in milliseconds (optional)
     */
    queue(eventType, eventData = null, delay = 0) {
        const event = {
            type: eventType,
            data: eventData,
            timestamp: Date.now(),
            delay: delay,
            scheduledTime: Date.now() + delay
        };
        
        this.eventQueue.push(event);
    },
    
    /**
     * Process queued events
     * @param {number} currentTime - Current time
     */
    processQueue(currentTime = Date.now()) {
        if (this.processing) return;
        
        this.processing = true;
        
        // Process events that are ready
        const readyEvents = [];
        const remainingEvents = [];
        
        for (const event of this.eventQueue) {
            if (currentTime >= event.scheduledTime) {
                readyEvents.push(event);
            } else {
                remainingEvents.push(event);
            }
        }
        
        this.eventQueue = remainingEvents;
        
        // Emit ready events
        for (const event of readyEvents) {
            this.emit(event.type, event.data);
        }
        
        this.processing = false;
    },
    
    /**
     * Clear all event listeners
     */
    clear() {
        this.listeners.clear();
        this.eventQueue = [];
        this.stats.totalEvents = 0;
        this.stats.eventsPerType.clear();
        this.stats.listenersPerType.clear();
    },
    
    /**
     * Clear listeners for specific event type
     * @param {string} eventType - Event type
     */
    clearEvent(eventType) {
        if (this.listeners.has(eventType)) {
            this.listeners.delete(eventType);
            this.stats.listenersPerType.delete(eventType);
        }
    },
    
    /**
     * Get listener count for event type
     * @param {string} eventType - Event type
     * @returns {number} Listener count
     */
    getListenerCount(eventType) {
        return this.listeners.has(eventType) ? this.listeners.get(eventType).length : 0;
    },
    
    /**
     * Get all event types with listeners
     * @returns {Array} Event types
     */
    getEventTypes() {
        return Array.from(this.listeners.keys());
    },
    
    /**
     * Get event statistics
     * @returns {Object} Event statistics
     */
    getStats() {
        return {
            totalEvents: this.stats.totalEvents,
            eventsPerType: Object.fromEntries(this.stats.eventsPerType),
            listenersPerType: Object.fromEntries(this.stats.listenersPerType),
            queuedEvents: this.eventQueue.length
        };
    },
    
    /**
     * Check if event type has listeners
     * @param {string} eventType - Event type
     * @returns {boolean} Whether event type has listeners
     */
    hasListeners(eventType) {
        return this.listeners.has(eventType) && this.listeners.get(eventType).length > 0;
    },
    
    /**
     * Get queued event count
     * @returns {number} Queued event count
     */
    getQueuedEventCount() {
        return this.eventQueue.length;
    },
    
    /**
     * Clear queued events
     */
    clearQueue() {
        this.eventQueue = [];
    },
    
    /**
     * Clear queued events of specific type
     * @param {string} eventType - Event type
     */
    clearQueueEvent(eventType) {
        this.eventQueue = this.eventQueue.filter(event => event.type !== eventType);
    },
    
    /**
     * Create event namespace
     * @param {string} namespace - Namespace prefix
     * @returns {Object} Namespace object with event methods
     */
    createNamespace(namespace) {
        return {
            on: (eventType, callback, context, priority) => 
                this.on(`${namespace}.${eventType}`, callback, context, priority),
            once: (eventType, callback, context, priority) => 
                this.once(`${namespace}.${eventType}`, callback, context, priority),
            emit: (eventType, eventData, stopPropagation) => 
                this.emit(`${namespace}.${eventType}`, eventData, stopPropagation),
            queue: (eventType, eventData, delay) => 
                this.queue(`${namespace}.${eventType}`, eventData, delay),
            off: (eventType, listenerId) => 
                this.off(`${namespace}.${eventType}`, listenerId),
            clear: () => {
                const eventTypes = this.getEventTypes().filter(type => type.startsWith(`${namespace}.`));
                eventTypes.forEach(type => this.clearEvent(type));
            }
        };
    },
    
    /**
     * Batch emit multiple events
     * @param {Array} events - Array of {type, data} objects
     * @param {boolean} stopPropagation - Whether to stop propagation after first handler
     * @returns {Array} Results for each event
     */
    batchEmit(events, stopPropagation = false) {
        return events.map(event => 
            this.emit(event.type, event.data, stopPropagation)
        );
    },
    
    /**
     * Wait for event with timeout
     * @param {string} eventType - Event type
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise} Promise that resolves with event data or rejects on timeout
     */
    waitFor(eventType, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                unsubscribe();
                reject(new Error(`Event ${eventType} timed out after ${timeout}ms`));
            }, timeout);
            
            const unsubscribe = this.once(eventType, (eventData) => {
                clearTimeout(timeoutId);
                resolve(eventData);
            });
        });
    },
    
    /**
     * Create event filter
     * @param {Function} filterFn - Filter function that takes event data and returns boolean
     * @returns {Object} Filter object with event methods
     */
    createFilter(filterFn) {
        return {
            on: (eventType, callback, context, priority) => {
                return this.on(eventType, (eventData) => {
                    if (filterFn(eventData)) {
                        callback.call(context, eventData);
                    }
                }, context, priority);
            },
            once: (eventType, callback, context, priority) => {
                return this.once(eventType, (eventData) => {
                    if (filterFn(eventData)) {
                        callback.call(context, eventData);
                    }
                }, context, priority);
            }
        };
    }
};
