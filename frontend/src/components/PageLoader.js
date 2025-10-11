import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandedLoader from './BrandedLoader';

const PageLoader = ({ children, loading = false, message = "Loading..." }) => {
  const [isLoading, setIsLoading] = useState(loading);
  const location = useLocation();

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return <BrandedLoader message={message} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default PageLoader;