import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { User, LogOut, ShoppingBag, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const LogoutButton = styled.button`
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">
          <ShoppingBag size={24} />
          RecommendMe
        </Logo>
        <NavLinks>
          <NavLink to="/products">
            <ShoppingBag size={18} />
            Products
          </NavLink>
          <NavLink to="/recommendations">
            <Star size={18} />
            Recommendations
          </NavLink>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </LogoutButton>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
}

export default Header; 