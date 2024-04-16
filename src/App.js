//import React from "react";
import Header from "./components/Header";
import "./App.css";
import React, { useState, useEffect } from 'react';
import RecipeExcerpt from "./components/RecipeExcerpt";

function App() {
  const [recipes, setRecipes] = useState([]);

  const fetchAllRecipes = async () => {
    try {
      const response = await fetch("/api/recipes");
      const results = await response.json();
      if (response.ok) { 
      setRecipes(results);
      } else {
        console.log(results);
      }
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  return (
    <div className='recipe-app'>
      <Header />
      <div className="recipe-list">
      {recipes.map((recipe) => (
        <RecipeExcerpt key={recipe.id} recipe={recipe} />
        ))}
      </div>
      <p>Your recipes here! </p>
    </div>
  );
}

export default App;
