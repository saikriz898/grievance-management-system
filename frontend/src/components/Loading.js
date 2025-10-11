import React from 'react';
import BrandedLoader from './BrandedLoader';

const Loading = ({ message = "Loading..." }) => {
  return <BrandedLoader message={message} />;
};

export default Loading;