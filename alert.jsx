const db = globalThis.__B44_DB__ || {
  auth: { isAuthenticated: async () => false, me: async () => null },
  entities: new Proxy({}, { get: () => ({ filter: async () => [], get: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) }) }),
  integrations: { Core: { UploadFile: async () => ({ file_url: '' }) } }
};

import React, { useState, useEffect } from "react";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FavoriteButton({ product, user, className = "" }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !product?.name) return;
      
      const favorites = await db.entities.FavoriteProduct.filter(
        { product_name: product.name },
        "-created_date",
        1
      );
      
      if (favorites.length > 0) {
        setIsFavorited(true);
        setFavoriteId(favorites[0].id);
      }
    };
    
    checkFavorite();
  }, [user, product?.name]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      db.auth.redirectToLogin();
      return;
    }

    setIsLoading(true);

    if (isFavorited && favoriteId) {
      await db.entities.FavoriteProduct.delete(favoriteId);
      setIsFavorited(false);
      setFavoriteId(null);
    } else {
      const newFavorite = await db.entities.FavoriteProduct.create({
        product_name: product.name,
        price: product.price,
        description: product.description,
        image_url: product.image_url,
        product_url: product.search_url || `https://www.google.com/search?q=${encodeURIComponent(product.name)}`,
        rating: product.rating
      });
      setIsFavorited(true);
      setFavoriteId(newFavorite.id);
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all ${className}`}
    >
      <Heart 
        className={`h-4 w-4 transition-all ${
          isFavorited 
            ? "text-rose-500 fill-rose-500" 
            : "text-slate-400"
        }`}
      />
    </Button>
  );
}