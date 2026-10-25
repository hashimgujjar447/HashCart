import axiosInstance from '@/utils/axiosInstance';
import React from 'react';
import ProductDetails from '@/shared/modules/product/product-details';

async function fetchProductDetails(slug: string) {
  try {
    const res = await axiosInstance.get(`/product/get-product/${slug}`);
    return res.data.product;
  } catch (error) {
    return null;
  }
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) => {
  const resolvedParams = await params;
  const productDetails = await fetchProductDetails(resolvedParams.slug);
  return {
    title: productDetails?.title || productDetails?.name || 'Product Details',
    description: productDetails?.description || '',
  };
};

const Page = async ({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) => {
  const resolvedParams = await params;
  const productDetails = await fetchProductDetails(resolvedParams.slug);

  if (!productDetails) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-gray-500 mt-2">
          The product you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return <ProductDetails product={productDetails} />;
};

export default Page;
