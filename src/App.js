//import React from "react";
import Header from "./components/Header";
import "./App.css";
import React, { useState, useEffect } from 'react';
import RecipeExcerpt from "./components/RecipeExcerpt";
import NewRecipeForm from "./components/NewRecipeForm";
import RecipeFull from "./components/RecipeFull";


function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showNewRecipeForm, setShowNewRecipeForm] = useState(false);

  const [newRecipe, setNewRecipe] = useState(
    {
      title: "",
    ingredients: "",
    instructions: "",
    servings: 1, // conservative default
    description: "",
    image_url: "https://images.pexels.com/photos/9986228/pexels-photo-9986228.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" //default
    }
  );
  
  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const response = await fetch("/api/recipes");
        if (response.ok) { 
          const results = await response.json();
          setRecipes(results);
        } else {
          console.log("Opps = could not fetch any recipes!");
        }
      } catch (e) {
        console.log("Something went wrong", e);
      }
    };
    fetchAllRecipes();
  }, []);

  const handleNewRecipe = async (e, newRecipe) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body:JSON.stringify(newRecipe)
    });

      if (response.ok) {
        const data = await response.json();
        setRecipes([...recipes, data.recipe]);
        console.log("Recipe successfully updated");
        setShowNewRecipeForm(false);
        setNewRecipe({
          title: "",
          ingredients: "",
          instructions: "",
          servings: 1,
          description: "",
          image_url: "https://images.pexels.com/photos/9986228/pexels-photo-9986228.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        });
      } else {
        console.error("Oh snap - could not add recipe!");
      }
    } catch (e) {
      console.error("An error occurred during the request:", e);
    }
  };

  const handleUpdateRecipe = async (e, selectedRecipe) => {
    e.preventDefault();
    const { id } = selectedRecipe;

    try {
      const response = await fetch(`/api/recipes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body:JSON.stringify(selectedRecipe)
    });

      if (response.ok) {
        const data = await response.json();
        setRecipes
          (recipes.map((recipe) => {
            if (recipe.id === id) {
              //return saved data from the db
              return data.recipe;
            }
            return recipe;
          })
          );
        console.log("Recipe updated!");
       } else {
        console.error("Oh snap - could not update recipe!");
      }
    } catch (e) {
      console.error("An error occurred during the request. Please try again later.");
    }
    setSelectedRecipe(null);
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleUnselectRecipe = () => {
    setSelectedRecipe(null);
  };

  const hideRecipeForm = () => {
    setShowNewRecipeForm(false);
  };

  const showRecipeForm = () => {
    setShowNewRecipeForm(true);
    setSelectedRecipe(null);
  };

  const onUpdateForm = (e, action = "new") => {
    const { name, value } = e.target;
    if (action === "update") {
      setSelectedRecipe({
        ...selectedRecipe,
        [name]: value
      });
    } else if (action === "new") {
    setNewRecipe({ ...newRecipe, [name]: value});
    }
  };

  
  return (
    <div className='recipe-app'>
      <Header showRecipeForm={showRecipeForm} />
      {showNewRecipeForm && (
        <NewRecipeForm 
          newRecipe={newRecipe} 
          hideRecipeForm={hideRecipeForm} 
          onUpdateForm={onUpdateForm} 
          handleNewRecipe={handleNewRecipe} 
          />
          )}
      {selectedRecipe && <RecipeFull 
      selectedRecipe={selectedRecipe} 
      handleUnselectRecipe={handleUnselectRecipe}
      onUpdateForm={onUpdateForm}
      handleUpdateRecipe={handleUpdateRecipe} />}
      {!selectedRecipe && (
      <div className="recipe-list">
      {recipes.map((recipe) => (
        <RecipeExcerpt key={recipe.id} recipe={recipe} handleSelectRecipe={handleSelectRecipe} />
        ))}
      </div>
      )}
    </div>
  );
}

export default App;
