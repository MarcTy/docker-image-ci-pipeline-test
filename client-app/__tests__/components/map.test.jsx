import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DEFAULT_TELEMETRY_FETCH_INTERVAL, UseSettingsGlobalState } from '../../src/context/SettingsContext.jsx';
import Map from '../../src/components/dashboard/Map.jsx';
import { beforeEach, afterEach, afterAll, describe, it, expect, vi } from 'vitest';

// <---- FIXES RESIZE OBSERVER NOT DEFINED ERROR ----> 
// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);
// <------------------------------------------------->


// Mocking the SettingsContext
vi.mock('../../src/context/SettingsContext.jsx', () => ({
  UseSettingsGlobalState: vi.fn(() => ({
    state: {},
    dispatch: vi.fn(),
  })),
  DEFAULT_TELEMETRY_FETCH_INTERVAL: 0
}));

describe('Map Component', () => {

  it('Renders without crashing', () => {
    render(<Map />);
  });

  it('initializes map with correct settings', () => {
    render(<Map />);
    
    // Check if the map is initialized with the initial position
    const olMap = document.querySelector('.ol-viewport'); // Ensure that OpenLayers map is rendered
    expect(olMap).toBeTruthy();
  });
});
