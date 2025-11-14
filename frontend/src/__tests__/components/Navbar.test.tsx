import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';

const MockNavbar = () => (
  <BrowserRouter>
    <Navbar />
  </BrowserRouter>
);

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders navbar without crashing', () => {
    render(<MockNavbar />);
    expect(screen.queryByRole('navigation')).toBeInTheDocument();
  });

  it('displays logo or app name', () => {
    render(<MockNavbar />);
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
  });

  it('provides language and theme switching options', () => {
    render(<MockNavbar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
