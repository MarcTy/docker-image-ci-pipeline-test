import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import GpsInfo from '../../src/components/dashboard/GpsInfo.jsx';
import { beforeEach, describe, it, expect, vi } from 'vitest';

// Mock the UseSettingsGlobalState context
// These functions have to be mocked so that it doesn't call the actual function during tests
// These functions are overwritten with functions that return nothing.
vi.mock('../../src/context/SettingsContext.jsx', () => ({
    UseSettingsGlobalState: () => ({
        state: {},
        dispatch: vi.fn(),
    }),
    DEFAULT_TILE_LAYER_URL: "",
}));
process.env.MQTT_SERVER_URL = ""; 

// Test that the component properly renders
describe('GpsInfo component', () => {

  it('GpsInfo should render and be null on startup', () => {
    render(<GpsInfo/>);

    // Check if all entries display "N/A"
    expect(screen.getByText(/Latitude: N\/A/i)).toBeTruthy();
    expect(screen.getByText(/Longitude: N\/A/i)).toBeTruthy();
    expect(screen.getByText(/North\/South: N\/A/i)).toBeTruthy();
    expect(screen.getByText(/East\/West: N\/A/i)).toBeTruthy();
    expect(screen.getByText(/Speed: N\/A m\/s/i)).toBeTruthy();
    expect(screen.getByText(/Time: N\/A/i)).toBeTruthy();
    expect(screen.getByText(/Date: N\/A/i)).toBeTruthy();
  });
});
