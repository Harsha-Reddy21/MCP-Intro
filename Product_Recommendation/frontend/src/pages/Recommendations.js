import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Star, Brain, Users, Tag, ShoppingCart, Heart } from 'lucide-react';
import { recommendationService, interactionService } from '../services/api';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 300;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

const AlgorithmInfo = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 3rem;
  text-align: center;
`;

const AlgorithmTitle = styled.h2`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const AlgorithmDescription = styled.p`
  opacity: 0.9;
  line-height: 1.6;
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const RecommendationCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const AlgorithmBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 1rem;

  &.collaborative {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.content_based {
    background: #f3e5f5;
    color: #7b1fa2;
  }

  &.hybrid {
    background: #e8f5e8;
    color: #388e3c;
  }
`;

const ProductCategory = styled.div`
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h3`
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.1rem;
`;

const ProductDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProductPrice = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.9rem;
`;

const RecommendationScore = styled.div`
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &.primary {
    background: #667eea;
    color: white;

    &:hover {
      background: #5a6fd8;
    }
  }

  &.secondary {
    background: #f8f9fa;
    color: #667eea;
    border: 1px solid #667eea;

    &:hover {
      background: #e9ecef;
    }
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 3rem;
  color: #e53e3e;
  background: #fee;
  border-radius: 8px;
  margin: 2rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyStateText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const EmptyStateSubtext = styled.p`
  color: #999;
  margin-bottom: 2rem;
`;

function Recommendations() {
  const {
    data: recommendations,
    isLoading,
    error,
  } = useQuery(
    'recommendations',
    () => recommendationService.getRecommendations(20),
    {
      select: (response) => response.data,
    }
  );

  const handleInteraction = async (productId, type) => {
    try {
      await interactionService.trackInteraction(productId, type);
      if (type === 'like') {
        toast.success('Added to favorites!');
      } else if (type === 'purchase') {
        toast.success('Purchase tracked!');
      }
    } catch (error) {
      toast.error('Failed to track interaction');
    }
  };

  const getAlgorithmIcon = (type) => {
    switch (type) {
      case 'collaborative':
        return <Users size={14} />;
      case 'content_based':
        return <Tag size={14} />;
      case 'hybrid':
        return <Brain size={14} />;
      default:
        return <Star size={14} />;
    }
  };

  const getAlgorithmLabel = (type) => {
    switch (type) {
      case 'collaborative':
        return 'Based on similar users';
      case 'content_based':
        return 'Based on your preferences';
      case 'hybrid':
        return 'Smart hybrid algorithm';
      default:
        return 'AI recommended';
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingText>Finding personalized recommendations...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorText>Failed to load recommendations. Please try again.</ErrorText>
      </Container>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Recommendations</Title>
          <Subtitle>
            Discover products tailored just for you
          </Subtitle>
        </Header>

        <EmptyState>
          <EmptyStateIcon>🤖</EmptyStateIcon>
          <EmptyStateText>No recommendations yet!</EmptyStateText>
          <EmptyStateSubtext>
            Start browsing products to help our AI learn your preferences.
          </EmptyStateSubtext>
          <Link
            to="/products"
            style={{
              background: '#667eea',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Browse Products
          </Link>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Your Recommendations</Title>
        <Subtitle>
          Personalized product suggestions powered by advanced AI algorithms
        </Subtitle>
      </Header>

      <AlgorithmInfo>
        <AlgorithmTitle>
          <Brain size={24} />
          AI-Powered Recommendations
        </AlgorithmTitle>
        <AlgorithmDescription>
          Our intelligent system analyzes your behavior, preferences, and finds patterns
          with similar users to suggest products you'll love. The recommendations combine
          collaborative filtering and content-based algorithms for the best results.
        </AlgorithmDescription>
      </AlgorithmInfo>

      <RecommendationsGrid>
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.product.id}>
            <Link
              to={`/products/${rec.product.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ProductImage
                src={rec.product.image_url}
                alt={rec.product.name}
              />
            </Link>
            <CardContent>
              <AlgorithmBadge className={rec.algorithm_type}>
                {getAlgorithmIcon(rec.algorithm_type)}
                {getAlgorithmLabel(rec.algorithm_type)}
              </AlgorithmBadge>
              
              <ProductCategory>{rec.product.category}</ProductCategory>
              <ProductName>{rec.product.name}</ProductName>
              <ProductDescription>{rec.product.description}</ProductDescription>
              
              <ProductFooter>
                <ProductPrice>${rec.product.price}</ProductPrice>
                <ProductRating>
                  <Star size={16} fill="currentColor" />
                  {rec.product.rating} ({rec.product.rating_count})
                </ProductRating>
              </ProductFooter>

              <RecommendationScore>
                Recommendation Score: {(rec.score * 100).toFixed(0)}%
              </RecommendationScore>

              <ActionButtons>
                <Button
                  className="secondary"
                  onClick={() => handleInteraction(rec.product.id, 'like')}
                >
                  <Heart size={16} />
                  Like
                </Button>
                <Button
                  className="primary"
                  onClick={() => handleInteraction(rec.product.id, 'purchase')}
                >
                  <ShoppingCart size={16} />
                  Buy
                </Button>
              </ActionButtons>
            </CardContent>
          </RecommendationCard>
        ))}
      </RecommendationsGrid>
    </Container>
  );
}

export default Recommendations; 