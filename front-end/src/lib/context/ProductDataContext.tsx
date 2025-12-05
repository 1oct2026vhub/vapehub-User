'use client';

import React, { createContext, useContext, useState, PropsWithChildren } from 'react';
import { ProductResponse } from '../config/product.config';

interface ProductDataContextType {
  productData: ProductResponse | null;
  setProductData: (data: ProductResponse) => void;
}

const ProductDataContext = createContext<ProductDataContextType | undefined>(undefined);

interface ProductDataProviderProps extends PropsWithChildren {
  initialData: ProductResponse;
}

export const ProductDataProvider: React.FC<ProductDataProviderProps> = ({ 
  children, 
  initialData 
}) => {
  const [productData, setProductData] = useState<ProductResponse>(initialData);

  return (
    <ProductDataContext.Provider value={{ productData, setProductData }}>
      {children}
    </ProductDataContext.Provider>
  );
};

export const useProductData = (): ProductDataContextType => {
  const context = useContext(ProductDataContext);
  if (context === undefined) {
    throw new Error('useProductData must be used within a ProductDataProvider');
  }
  return context;
};

