# BOTA Refactoring Plan
## UI Component Refactoring Complete - Next Phase: System Refactoring

### 🎯 **Overview**
After successfully refactoring UI components (Modal, ScreenLayout, DebugWindow, ListContainer, Tabs, ImageCard), the next phase focuses on breaking down large monolithic files and extracting reusable system components.

### 📊 **Current State Analysis**
- **UI Components**: ✅ Complete (6 components created)
- **Large Files Identified**: 4 files over 1,000 lines
- **Complex Systems**: 3 major systems needing separation
- **Data Files**: 1 massive data file for optimization

---

## 🚀 **Phase 1: Trading System Refactoring** 
**Priority: HIGH | Impact: HIGH | Effort: MEDIUM**

### **Current Issues**
- `ui.js` trading functions: 500+ lines each
- Repetitive DOM creation for sliders
- Complex transaction logic mixed with UI
- Hard to maintain and test

### **Refactoring Tasks**

#### **1.1 Create Trading Slider Component** (2-3 hours)
**File**: `src/components/trading_slider.js`
**Purpose**: Reusable slider with price calculation and validation
```javascript
const TradingSlider = {
    create(goodId, currentPrice, maxQuantity, onValueChange) {
        // Reusable slider creation with:
        // - Price calculation
        // - Quantity validation
        // - Visual feedback
        // - Event handling
    }
};
```

#### **1.2 Extract Transaction Manager** (3-4 hours)
**File**: `src/transaction_manager.js`
**Purpose**: Pure transaction logic separated from UI
```javascript
const TransactionManager = {
    validateTransaction(port, boat, transactions) { /* validation logic */ },
    calculateCost(port, transactions) { /* cost calculation */ },
    executeTransaction(port, boat, transactions) { /* execution logic */ },
    getTransactionSummary(transactions) { /* summary generation */ }
};
```

#### **1.3 Create Trading Screen Layout** (1-2 hours)
**File**: `src/components/trading_screen.js`
**Purpose**: Use ScreenLayout component for consistency
- Replace custom trading screen with ScreenLayout
- Integrate TradingSlider components
- Use Modal component for transaction summary

#### **1.4 Separate Price Calculation** (2-3 hours)
**File**: `src/pricing_engine.js`
**Purpose**: Centralized pricing logic
```javascript
const PricingEngine = {
    calculatePrice(port, goodId, quantity) { /* price calculation */ },
    getPriceRange(port, goodId) { /* min/max prices */ },
    applyFactionModifiers(port, goodId, basePrice) { /* faction effects */ }
};
```

### **Expected Benefits**
- **Code Reduction**: ~400 lines removed from `ui.js`
- **Reusability**: Trading sliders can be used in other screens
- **Testability**: Pure functions easier to test
- **Maintainability**: Clear separation of concerns

---

## 🚀 **Phase 2: Game State Management**
**Priority: HIGH | Impact: HIGH | Effort: MEDIUM**

### **Current Issues**
- `game.js` (1,603 lines) mixed responsibilities
- State, rendering, input, and game logic combined
- Camera logic mixed with game logic
- Hard to test individual components

### **Refactoring Tasks**

#### **2.1 Create Game State Manager** (4-5 hours)
**File**: `src/game_state.js`
**Purpose**: Centralized state management with event system
```javascript
const GameState = {
    state: { /* centralized state */ },
    get: (key) => { /* getter with validation */ },
    set: (key, value) => { /* setter with events */ },
    subscribe: (key, callback) => { /* event subscription */ },
    emit: (event, data) => { /* event emission */ }
};
```

#### **2.2 Extract Camera Controller** (3-4 hours)
**File**: `src/camera_controller.js`
**Purpose**: Separate camera logic from game logic
```javascript
const CameraController = {
    position: { x: 0, y: 0, zoom: 1.0 },
    update: (deltaTime) => { /* camera update logic */ },
    follow: (target) => { /* camera following */ },
    pan: (direction, speed) => { /* manual panning */ },
    zoom: (factor) => { /* zoom control */ }
};
```

#### **2.3 Create Game Loop Manager** (2-3 hours)
**File**: `src/game_loop.js`
**Purpose**: Extract main game loop logic
```javascript
const GameLoop = {
    running: false,
    lastFrameTime: 0,
    start: () => { /* start game loop */ },
    stop: () => { /* stop game loop */ },
    update: (deltaTime) => { /* frame update logic */ }
};
```

#### **2.4 Create Event System** (2-3 hours)
**File**: `src/event_system.js`
**Purpose**: Event-driven architecture
```javascript
const EventSystem = {
    listeners: {},
    on: (event, callback) => { /* event subscription */ },
    off: (event, callback) => { /* event unsubscription */ },
    emit: (event, data) => { /* event emission */ }
};
```

### **Expected Benefits**
- **Separation of Concerns**: Clear boundaries between systems
- **Testability**: Individual components can be tested
- **Event-Driven**: Loose coupling between systems
- **Maintainability**: Easier to modify individual systems

---

## 🚀 **Phase 3: Rendering System**
**Priority: MEDIUM | Impact: MEDIUM | Effort: MEDIUM**

### **Current Issues**
- `renderer.js` (1,491 lines) single massive render function
- Mixed 2D and 3D rendering logic
- Asset management mixed with rendering
- Debug rendering mixed with game rendering

### **Refactoring Tasks**

#### **3.1 Create Render Layers** (4-5 hours)
**File**: `src/render_layers.js`
**Purpose**: Separate rendering concerns into layers
```javascript
const RenderLayers = {
    background: (ctx, camera) => { /* background rendering */ },
    gameObjects: (ctx, camera) => { /* game objects */ },
    ui: (ctx, camera) => { /* UI elements */ },
    debug: (ctx, camera) => { /* debug info */ },
    render: (ctx, camera) => { /* layer composition */ }
};
```

#### **3.2 Extract Asset Manager** (3-4 hours)
**File**: `src/asset_manager.js`
**Purpose**: Centralized asset loading and management
```javascript
const AssetManager = {
    assets: {},
    load: (name, path) => { /* asset loading */ },
    get: (name) => { /* asset retrieval */ },
    preload: (assetList) => { /* batch loading */ },
    isLoaded: (name) => { /* loading status */ }
};
```

#### **3.3 Create Debug Renderer** (2-3 hours)
**File**: `src/debug_renderer.js`
**Purpose**: Separate debug rendering from game rendering
```javascript
const DebugRenderer = {
    enabled: false,
    render: (ctx, camera, debugData) => { /* debug rendering */ },
    toggle: (feature) => { /* toggle debug features */ }
};
```

#### **3.4 Modular Render Pipeline** (3-4 hours)
**File**: `src/render_pipeline.js`
**Purpose**: Composable rendering system
```javascript
const RenderPipeline = {
    stages: [],
    addStage: (stage) => { /* add render stage */ },
    removeStage: (stage) => { /* remove render stage */ },
    render: (ctx, camera) => { /* execute pipeline */ }
};
```

### **Expected Benefits**
- **Modularity**: Easy to add/remove render features
- **Performance**: Better rendering optimization
- **Debugging**: Cleaner debug rendering
- **Maintainability**: Easier to modify rendering logic

---

## 🚀 **Phase 4: Economy System**
**Priority: MEDIUM | Impact: MEDIUM | Effort: LOW**

### **Current Issues**
- `economy.js` (1,168 lines) massive data structures mixed with logic
- Complex pricing calculations
- Port simulation mixed with trading logic

### **Refactoring Tasks**

#### **4.1 Extract Goods Data Service** (2-3 hours)
**File**: `src/goods_data_service.js`
**Purpose**: Separate goods definitions from logic
```javascript
const GoodsDataService = {
    getGood: (goodId) => { /* good data retrieval */ },
    getGoodsByTier: (tier) => { /* tier-based filtering */ },
    getProductionChain: (goodId) => { /* production chain */ },
    validateGood: (goodId) => { /* good validation */ }
};
```

#### **4.2 Create Pricing Engine** (3-4 hours)
**File**: `src/pricing_engine.js`
**Purpose**: Centralized pricing calculations
```javascript
const PricingEngine = {
    calculateBasePrice: (goodId) => { /* base price calculation */ },
    applySupplyDemand: (port, goodId, basePrice) => { /* supply/demand */ },
    applyFactionModifiers: (port, goodId, price) => { /* faction effects */ },
    getPriceRange: (port, goodId) => { /* min/max prices */ }
};
```

#### **4.3 Separate Port Simulation** (3-4 hours)
**File**: `src/port_simulation.js`
**Purpose**: Extract port production/consumption logic
```javascript
const PortSimulation = {
    updateProduction: (port, deltaTime) => { /* production logic */ },
    updateConsumption: (port, deltaTime) => { /* consumption logic */ },
    calculateSupply: (port, goodId) => { /* supply calculation */ },
    calculateDemand: (port, goodId) => { /* demand calculation */ }
};
```

#### **4.4 Create Trade Validator** (2-3 hours)
**File**: `src/trade_validator.js`
**Purpose**: Pure trade validation logic
```javascript
const TradeValidator = {
    validateTransaction: (port, boat, transactions) => { /* validation */ },
    checkCargoSpace: (boat, transactions) => { /* cargo validation */ },
    checkGold: (player, transactions) => { /* gold validation */ },
    checkPortStock: (port, transactions) => { /* stock validation */ }
};
```

### **Expected Benefits**
- **Data Separation**: Clean separation of data and logic
- **Reusability**: Pricing logic can be used elsewhere
- **Testability**: Pure functions easier to test
- **Performance**: Better data structure optimization

---

## 🚀 **Phase 5: Data Optimization**
**Priority: LOW | Impact: LOW | Effort: LOW**

### **Current Issues**
- `collision_data.js` (4,530 lines) massive hardcoded data array
- No compression or optimization
- Large file size impacts loading

### **Refactoring Tasks**

#### **5.1 Data Compression** (2-3 hours)
**File**: `src/collision_data_compressed.js`
**Purpose**: Compress collision data for better performance
- Use binary format or compression
- Reduce file size by 60-80%
- Maintain same functionality

#### **5.2 Lazy Loading** (1-2 hours)
**File**: `src/collision_loader.js`
**Purpose**: Load collision data on demand
- Load only visible areas
- Dynamic loading based on camera position
- Reduce initial load time

#### **5.3 Data Generator Tool** (3-4 hours)
**File**: `tools/collision_generator.js`
**Purpose**: Create tool to generate collision data
- Automated data generation
- Version control friendly
- Easy to modify collision data

### **Expected Benefits**
- **Performance**: Faster loading times
- **Maintainability**: Easier to modify collision data
- **File Size**: Smaller bundle size
- **Memory**: Lower memory usage

---

## 📅 **Implementation Timeline**

### **Week 1: Trading System Refactoring**
- Day 1-2: Trading Slider Component
- Day 3-4: Transaction Manager
- Day 5: Trading Screen Layout + Price Calculation

### **Week 2: Game State Management**
- Day 1-2: Game State Manager
- Day 3-4: Camera Controller
- Day 5: Game Loop Manager + Event System

### **Week 3: Rendering System**
- Day 1-2: Render Layers
- Day 3-4: Asset Manager
- Day 5: Debug Renderer + Render Pipeline

### **Week 4: Economy System + Data Optimization**
- Day 1-2: Goods Data Service + Pricing Engine
- Day 3-4: Port Simulation + Trade Validator
- Day 5: Data Compression + Lazy Loading

---

## 🎯 **Success Metrics**

### **Code Quality**
- **Lines of Code**: Reduce by ~2,000 lines across all files
- **Cyclomatic Complexity**: Reduce average complexity by 30%
- **Function Length**: Keep functions under 20 lines (per .cursorrules)

### **Maintainability**
- **Separation of Concerns**: Clear boundaries between systems
- **Testability**: 80% of new components unit testable
- **Reusability**: 5+ reusable components created

### **Performance**
- **Loading Time**: Reduce initial load time by 20%
- **Memory Usage**: Reduce memory footprint by 15%
- **Bundle Size**: Reduce total bundle size by 25%

### **Developer Experience**
- **Code Navigation**: Easier to find and modify code
- **Debugging**: Cleaner debug output and error messages
- **Documentation**: Each component well-documented

---

## 🔧 **Implementation Guidelines**

### **Code Standards**
- Follow existing `.cursorrules` guidelines
- Use `AIDEV-NOTE:` comments for complex sections
- Keep functions under 20 lines when possible
- Use explicit parameter passing

### **Testing Strategy**
- Test each component individually
- Maintain backward compatibility
- Use browser testing for UI components
- Validate game functionality after each phase

### **Documentation**
- Update component documentation
- Add usage examples for new components
- Update architecture diagrams
- Document breaking changes

---

## 🚨 **Risk Mitigation**

### **Breaking Changes**
- Maintain backward compatibility during refactoring
- Use feature flags for new components
- Gradual migration strategy
- Comprehensive testing

### **Performance Impact**
- Monitor performance during refactoring
- Optimize critical paths first
- Use performance profiling tools
- Maintain 60fps target

### **Code Quality**
- Regular code reviews
- Automated linting and formatting
- Follow established patterns
- Document architectural decisions

---

## 📋 **Next Steps**

1. **Review Plan**: Get approval for refactoring approach
2. **Start Phase 1**: Begin with Trading System Refactoring
3. **Create Components**: Implement TradingSlider component first
4. **Test Integration**: Ensure components work with existing code
5. **Iterate**: Refine approach based on initial results

This refactoring plan will significantly improve code maintainability, reusability, and performance while maintaining the game's existing functionality and following the project's coding standards.
