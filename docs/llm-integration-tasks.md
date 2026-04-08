# LLM Integration Tasks

## Project: Multi-Model Support for Transformer Explainer
**Start Date**: April 7, 2026  
**Target Completion**: June 9, 2026  
**Sprint Duration**: 2 weeks per sprint

---

## Phase 1: Local LLM Support via Ollama 🏠

### Sprint 1: Foundation (Weeks 1-2)

#### Infrastructure Setup
- [ ] Create `src/lib/ollama-client.ts` - Ollama API wrapper class
- [ ] Create `src/lib/model-manager.ts` - Unified model interface
- [ ] Add Ollama connection health check utility
- [ ] Create model metadata types/interfaces
- [ ] Set up model availability caching (localStorage)

**Testing Required**:
- [ ] Unit test: OllamaClient.listModels()
- [ ] Unit test: OllamaClient.generate()
- [ ] Unit test: Connection error handling
- [ ] Integration test: Mock Ollama server responses

#### UI Components
- [ ] Create `ModelSelector.svelte` component
- [ ] Create `ModelStatus.svelte` - Connection indicator
- [ ] Create `ModelCard.svelte` - Model info display
- [ ] Add model selector to Topbar
- [ ] Create Ollama setup instructions modal

**Testing Required**:
- [ ] Component test: ModelSelector renders with options
- [ ] Component test: ModelStatus shows correct connection state
- [ ] Component test: ModelCard displays metadata correctly
- [ ] E2E test: User can switch between GPT-2 and Ollama models

#### Store Updates
- [ ] Add `modelProviders.ts` store
- [ ] Add `selectedOllamaModel` writable
- [ ] Add `ollamaConnectionStatus` readable
- [ ] Update `modelData` type to support Ollama responses

**Testing Required**:
- [ ] Store test: Provider state management
- [ ] Store test: Connection status updates correctly

---

### Phase 1 Completion Criteria
- [ ] User can select from available Ollama models
- [ ] Connection status is visible in UI
- [ ] Graceful fallback when Ollama unavailable
- [ ] All tests passing (`pnpm test`)

---

## Phase 2: Cloud Model APIs ☁️

### Sprint 2: OpenRouter Integration (Weeks 3-4)

#### OpenRouter Client
- [ ] Create `src/lib/openrouter-client.ts`
- [ ] Implement API key management (secure storage)
- [ ] Add rate limiting protection
- [ ] Implement cost tracking per request
- [ ] Add model availability caching

**Testing Required**:
- [ ] Unit test: OpenRouterClient.chatCompletion()
- [ ] Unit test: Rate limiting behavior
- [ ] Unit test: Cost calculation accuracy
- [ ] Unit test: API key validation

#### UI Updates
- [ ] Create API key input component (secure)
- [ ] Add OpenRouter model dropdown
- [ ] Create cost estimator component
- [ ] Add usage dashboard (daily/weekly stats)

**Testing Required**:
- [ ] Component test: API key input masks key
- [ ] Component test: Cost estimator shows correct price
- [ ] E2E test: User can add API key and get completions

#### Store Updates
- [ ] Add `openrouterConfig` store
- [ ] Add `apiUsageStats` store
- [ ] Add `cloudModelSelection` store

---

### Sprint 3: Groq & OpenAI Integration (Weeks 5-6)

#### Groq Client
- [ ] Create `src/lib/groq-client.ts`
- [ ] Verify latest `groq-sdk` package (^0.12.0)
- [ ] Implement streaming response support
- [ ] Add performance benchmarking

**Testing Required**:
- [ ] Unit test: GroqClient.generate()
- [ ] Unit test: Streaming response handling
- [ ] Performance test: Verify <100ms first token latency

#### OpenAI Client
- [ ] Verify `openai` package (^5.0.0) supports GPT-5.4
- [ ] Create `src/lib/openai-client.ts`
- [ ] Implement reasoning effort parameter
- [ ] Add logprobs extraction for visualization

**Testing Required**:
- [ ] Unit test: OpenAI client with GPT-5.4
- [ ] Unit test: Reasoning effort levels
- [ ] Unit test: Logprobs parsing

#### Unified Provider Interface
- [ ] Create abstract `BaseModelProvider` class
- [ ] Implement for Ollama, OpenRouter, Groq, OpenAI
- [ ] Add provider factory function

**Testing Required**:
- [ ] Unit test: Factory creates correct provider
- [ ] Integration test: All providers return consistent format

---

### Phase 2 Completion Criteria
- [ ] Support for 4+ cloud providers
- [ ] API key management is secure
- [ ] Cost tracking is accurate
- [ ] All tests passing

---

## Phase 3: Multi-Model Comparison 📊

### Sprint 4: Comparison UI (Weeks 7-9)

#### Comparison Components
- [ ] Create `ComparisonView.svelte`
- [ ] Create `AttentionDiff.svelte`
- [ ] Add synchronized animation across models
- [ ] Implement split-pane layout (2-4 models)

**Testing Required**:
- [ ] Component test: ComparisonView renders multiple models
- [ ] Component test: Animations sync correctly
- [ ] Component test: Split-pane resizes correctly
- [ ] E2E test: User can compare 2 models side-by-side

#### Attention Analysis Features
- [ ] Implement attention entropy calculation
- [ ] Create attention correlation matrix
- [ ] Add token-level comparison tooltips
- [ ] Implement difference highlighting

**Testing Required**:
- [ ] Unit test: Entropy calculation accuracy
- [ ] Unit test: Correlation matrix generation
- [ ] Unit test: Difference detection algorithm

#### Export Features
- [ ] Add CSV export for attention matrices
- [ ] Add JSON export for research data
- [ ] Implement SVG export for visualizations

**Testing Required**:
- [ ] Unit test: CSV export format
- [ ] Unit test: JSON export structure
- [ ] Unit test: SVG generation

---

### Phase 3 Completion Criteria
- [ ] Side-by-side comparison works for 2-4 models
- [ ] Attention difference visualization is clear
- [ ] Export formats are research-ready
- [ ] All tests passing

---

## Phase 4: Polish & Documentation 🎨

### Sprint 5: Final Polish (Weeks 10-11)

#### Performance Optimization
- [ ] Implement model response caching
- [ ] Add lazy loading for model components
- [ ] Optimize attention matrix rendering
- [ ] Add virtualization for long sequences

**Testing Required**:
- [ ] Performance test: First render <2s
- [ ] Performance test: Animation 60fps
- [ ] Memory test: No leaks during model switching

#### Documentation
- [ ] Update README.md with new features
- [ ] Create `docs/LLM-SETUP.md` guide
- [ ] Add inline help tooltips
- [ ] Create tutorial video script

**Testing Required**:
- [ ] Docs review: Setup instructions work
- [ ] Docs review: API documentation accurate

#### User Testing
- [ ] Conduct usability testing with 5+ educators
- [ ] Collect feedback on comparison features
- [ ] Iterate on UI based on feedback

---

### Final Completion Criteria
- [ ] All 4 phases complete
- [ ] 90%+ test coverage
- [ ] Documentation complete
- [ ] User feedback positive

---

## Testing Strategy

### Unit Tests (Jest/Vitest)
```typescript
// Example test structure
describe('OllamaClient', () => {
  it('should list available models', async () => {
    // Test implementation
  });
  
  it('should handle connection errors gracefully', async () => {
    // Test implementation
  });
});
```

### Component Tests (Testing Library)
```typescript
// Example component test
describe('ModelSelector', () => {
  it('renders all available models', () => {
    // Test implementation
  });
  
  it('disables models that are not available', () => {
    // Test implementation
  });
});
```

### E2E Tests (Playwright)
```typescript
// Example E2E test
test('user can compare two models', async ({ page }) => {
  await page.goto('/');
  await page.click('#compare-mode');
  await page.selectOption('#model-a', 'gpt2');
  await page.selectOption('#model-b', 'llama4');
  await expect(page.locator('.comparison-view')).toBeVisible();
});
```

---

## Dependencies to Add

### Verified Latest Versions (April 7, 2026)

```json
{
  "dependencies": {
    "openai": "^5.0.0",
    "groq-sdk": "^0.12.0"
  },
  "devDependencies": {
    "@testing-library/svelte": "^5.2.0",
    "vitest": "^4.1.0",
    "@vitest/browser": "^4.1.0"
  }
}
```

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits | High | Implement caching, backoff strategies |
| Model availability changes | Medium | Dynamic model list fetching |
| Browser CORS issues | High | Use proxy server for cloud APIs |
| Performance with large models | High | Virtualization, lazy loading |
| API key security | Critical | Never store keys in code, use env vars |

---

## Weekly Checklist

### Week 1-2: Ollama Foundation
- [ ] Ollama client implemented
- [ ] Model selector UI complete
- [ ] Tests passing

### Week 3-4: OpenRouter
- [ ] OpenRouter client working
- [ ] API key management secure
- [ ] Cost tracking accurate

### Week 5-6: Groq & OpenAI
- [ ] Groq integration complete
- [ ] OpenAI GPT-5.4 tested
- [ ] Unified provider interface working

### Week 7-9: Comparison Features
- [ ] Comparison UI functional
- [ ] Attention analysis working
- [ ] Export features complete

### Week 10-11: Polish
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] User testing complete

---

**Last Updated**: April 7, 2026  
**Next Review**: Weekly on Mondays
