"use client";

import React, { useEffect, useState } from 'react';
import appwriteService from '@/appwrite/config';

interface HomeProps {
  user?: {
    name: string;
  };
}

const WelcomePage: React.FC = () => {
  const [user, setUser] = useState<HomeProps['user'] | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await appwriteService.getCurrentUser();
      if (currentUser) {
        setUser({ name: currentUser.name });
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="mx-auto text-center">
      <h2 className="text-3xl font-semibold text-gray-900">
        {user ? `Welcome Back, ${user.name}!` : "Loading..."}
      </h2>
      <p className="mt-4 text-gray-700">
        We&apos;re glad to see you again. Explore the links above to continue.
      </p>
    </div>
  );
};

export default WelcomePage;
