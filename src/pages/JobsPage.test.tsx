import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { DemoProvider } from '../state/DemoContext';
import { JobsPage } from './JobsPage';

describe('consulta de trabalhos', () => {
  beforeEach(() => localStorage.clear());

  it('busca por cliente e referência e mostra versões atual/aprovada', () => {
    render(<MemoryRouter><DemoProvider><JobsPage /></DemoProvider></MemoryRouter>);
    const input = screen.getByPlaceholderText(/Mercado Horizonte/);
    fireEvent.change(input, { target: { value: 'ART-1048' } });
    expect(screen.getByText('Mercado Horizonte')).toBeInTheDocument();
    expect(screen.getByText('1', { selector: '.results-count strong' })).toBeInTheDocument();
    expect(screen.getAllByText('V3').length).toBeGreaterThanOrEqual(2);
  });

  it('aplica filtro de status real', () => {
    render(<MemoryRouter><DemoProvider><JobsPage /></DemoProvider></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Alteração solicitada' }));
    expect(screen.getByText('Café Aurora')).toBeInTheDocument();
    expect(screen.queryByText('Clínica Prisma')).not.toBeInTheDocument();
  });
});
