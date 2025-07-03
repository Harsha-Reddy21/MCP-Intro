import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { ArrowLeft, Star, ShoppingCart, Heart } from 'lucide-react';
import { productService, interactionService } from '../services/api';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  margin-bottom: 2rem;
  font-weight: 500;

  &:hover {
    opacity: 0.8;
  }
`;

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div`
  text-align: center;
`;

const ProductImage = styled.img`
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const InfoSection = styled.div``;

const Category = styled.div`
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-weight: 500;
`;

const ProductName = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 300;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #ffa500;
`;

const RatingText = styled.span`
  color: #666;
  margin-left: 0.5rem;
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-1px);
  }

  &.primary {
    background: #667eea;
    color: white;

    &:hover {
      background: #5a6fd8;
    }
  }

  &.secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover {
      background: #f8f9fa;
    }
  }
`;

const Specifications = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SpecTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const SpecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

const SpecValue = styled.span`
  color: #333;
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

function ProductDetail() {
  const { id } = useParams();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery(
    ['product', id],
    () => productService.getProduct(id),
    {
      select: (response) => response.data,
    }
  );

  // Track product view when component mounts
  useEffect(() => {
    if (product) {
      const trackView = async () => {
        try {
          await interactionService.trackInteraction(product.id, 'view');
        } catch (error) {
          // Silently handle view tracking errors
        }
      };
      trackView();
    }
  }, [product]);

  const handleInteraction = async (type) => {
    if (!product) return;

    try {
      await interactionService.trackInteraction(product.id, type);
      if (type === 'like') {
        toast.success('Added to favorites!');
      } else if (type === 'purchase') {
        toast.success('Purchase tracked! Thank you for your order.');
      }
    } catch (error) {
      toast.error('Failed to track interaction');
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingText>Loading product details...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorText>Failed to load product details. Please try again.</ErrorText>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <ErrorText>Product not found.</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton to="/products">
        <ArrowLeft size={20} />
        Back to Products
      </BackButton>

      <ProductLayout>
        <ImageSection>
          <ProductImage
            src={product.image_url}
            alt={product.name}
          />
        </ImageSection>

        <InfoSection>
          <Category>{product.category}</Category>
          <ProductName>{product.name}</ProductName>
          
          <RatingSection>
            <Rating>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                />
              ))}
            </Rating>
            <RatingText>
              {product.rating} ({product.rating_count} reviews)
            </RatingText>
          </RatingSection>

          <Price>${product.price}</Price>
          
          <Description>{product.description}</Description>

          <ActionButtons>
            <Button
              className="primary"
              onClick={() => handleInteraction('purchase')}
            >
              <ShoppingCart size={20} />
              Buy Now
            </Button>
            <Button
              className="secondary"
              onClick={() => handleInteraction('like')}
            >
              <Heart size={20} />
              Add to Favorites
            </Button>
          </ActionButtons>
        </InfoSection>
      </ProductLayout>

      <Specifications>
        <SpecTitle>Product Details</SpecTitle>
        <SpecGrid>
          <SpecItem>
            <SpecLabel>Category:</SpecLabel>
            <SpecValue>{product.category}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Price:</SpecLabel>
            <SpecValue>${product.price}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Rating:</SpecLabel>
            <SpecValue>{product.rating}/5</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Reviews:</SpecLabel>
            <SpecValue>{product.rating_count}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Product ID:</SpecLabel>
            <SpecValue>#{product.id}</SpecValue>
          </SpecItem>
          <SpecItem>
            <SpecLabel>Added:</SpecLabel>
            <SpecValue>
              {new Date(product.created_at).toLocaleDateString()}
            </SpecValue>
          </SpecItem>
        </SpecGrid>
      </Specifications>
    </Container>
  );
}

export default ProductDetail; 