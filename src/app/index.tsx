import { Redirect } from 'expo-router';
import React from 'react';
import { useAppStore } from '@/store/useAppStore';

const Index = () => {
  const account = useAppStore((state) => state.account);

  if (!account) {
    return <Redirect href="/connect" />;
  }

  return <Redirect href="/deck" />;
};

export default Index;
