import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import HomePage from '../HomePage';

describe('Smoke tests', () => {
  it('renders HomePage title', () => {
    const { getByText } = render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );
    expect(getByText('仪表板')).toBeTruthy();
  });
});


