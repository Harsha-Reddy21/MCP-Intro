import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { ShoppingBag, Star, TrendingUp, User } from 'lucide-react';
import { recommendationService } from '../services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  margin-bottom: 3rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 300;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const ActionCard = styled(Link)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ActionIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ActionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
`;

const ActionDescription = styled.p`
  color: #666;
  line-height: 1.5;
`;

const RecommendationsPreview = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecommendationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ProductCard = styled.div`
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h4`
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9rem;
`;

const ProductPrice = styled.div`
  font-weight: bold;
  color: #667eea;
`;

function Dashboard() {
  const { data: recommendations, isLoading } = useQuery(
    'recommendations-preview',
    () => recommendationService.getRecommendations(4),
    {
      select: (response) => response.data,
    }
  );

  return (
    <Container>
      <WelcomeSection>
        <Title>Welcome to RecommendMe</Title>
        <Subtitle>
          Discover personalized product recommendations powered by AI
        </Subtitle>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatIcon color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <ShoppingBag size={24} />
          </StatIcon>
          <StatContent>
            <StatNumber>∞</StatNumber>
            <StatLabel>Products Available</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <Star size={24} />
          </StatIcon>
          <StatContent>
            <StatNumber>AI</StatNumber>
            <StatLabel>Powered Recommendations</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatNumber>Smart</StatNumber>
            <StatLabel>Learning Algorithm</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        <ActionCard to="/products">
          <ActionHeader>
            <ActionIcon color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <ShoppingBag size={24} />
            </ActionIcon>
            <ActionTitle>Browse Products</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Explore our vast catalog of products across multiple categories.
            Find exactly what you're looking for.
          </ActionDescription>
        </ActionCard>

        <ActionCard to="/recommendations">
          <ActionIcon color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <Star size={24} />
          </ActionIcon>
          <ActionHeader>
            <ActionTitle>Get Recommendations</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Discover products tailored just for you based on your preferences
            and behavior patterns.
          </ActionDescription>
        </ActionCard>
      </QuickActions>

      {!isLoading && recommendations && recommendations.length > 0 && (
        <RecommendationsPreview>
          <SectionTitle>
            <Star size={20} />
            Recommendations for You
          </SectionTitle>
          <RecommendationGrid>
            {recommendations.map((rec) => (
              <ProductCard key={rec.product.id}>
                <ProductImage
                  src={rec.product.image_url}
                  alt={rec.product.name}
                />
                <ProductInfo>
                  <ProductName>{rec.product.name}</ProductName>
                  <ProductPrice>${rec.product.price}</ProductPrice>
                </ProductInfo>
              </ProductCard>
            ))}
          </RecommendationGrid>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link
              to="/recommendations"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              View All Recommendations →
            </Link>
          </div>
        </RecommendationsPreview>
      )}
    </Container>
  );
}

export default Dashboard; 