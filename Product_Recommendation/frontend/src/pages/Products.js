import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Search, Filter, Star } from 'lucide-react';
import { productService, interactionService } from '../services/api';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.1rem;
`;

const ProductCategory = styled.div`
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

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

function Products() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories
  const { data: categories } = useQuery('categories', () =>
    productService.getCategories().then((res) => res.data)
  );

  // Fetch products
  const {
    data: products,
    isLoading,
    error,
  } = useQuery(
    ['products', selectedCategory],
    () => productService.getProducts(selectedCategory || undefined),
    {
      select: (response) => response.data,
    }
  );

  // Filter products based on search term
  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const handleProductView = async (productId) => {
    try {
      await interactionService.trackInteraction(productId, 'view');
    } catch (error) {
      // Silently handle view tracking errors
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingText>Loading products...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorText>Failed to load products. Please try again.</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Products</Title>
      </Header>

      <FiltersSection>
        <SearchInput
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories?.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </FiltersSection>

      <ProductGrid>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id}>
            <Link
              to={`/products/${product.id}`}
              onClick={() => handleProductView(product.id)}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ProductImage
                src={product.image_url}
                alt={product.name}
              />
              <ProductInfo>
                <ProductCategory>{product.category}</ProductCategory>
                <ProductName>{product.name}</ProductName>
                <ProductDescription>{product.description}</ProductDescription>
                <ProductFooter>
                  <ProductPrice>${product.price}</ProductPrice>
                  <ProductRating>
                    <Star size={16} fill="currentColor" />
                    {product.rating} ({product.rating_count})
                  </ProductRating>
                </ProductFooter>
              </ProductInfo>
            </Link>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              <ActionButtons>
                <Button
                  className="secondary"
                  onClick={() => handleInteraction(product.id, 'like')}
                >
                  ❤️ Like
                </Button>
                <Button
                  className="primary"
                  onClick={() => handleInteraction(product.id, 'purchase')}
                >
                  🛒 Buy
                </Button>
              </ActionButtons>
            </div>
          </ProductCard>
        ))}
      </ProductGrid>

      {filteredProducts.length === 0 && (
        <LoadingText>
          {searchTerm || selectedCategory
            ? 'No products found matching your criteria.'
            : 'No products available.'}
        </LoadingText>
      )}
    </Container>
  );
}

export default Products; 