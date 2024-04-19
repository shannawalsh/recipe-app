//import React from "react";
import Header from "./components/Header";
import "./App.css";
import React, { useState, useEffect } from 'react';
import RecipeExcerpt from "./components/RecipeExcerpt";
import NewRecipeForm from "./components/NewRecipeForm";
import RecipeFull from "./components/RecipeFull";
import displayToast from "./helpers/toastHelper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showNewRecipeForm, setShowNewRecipeForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
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
          displayToast("Opps = could not fetch any recipes!", "success");
        }
      } catch (e) {
        displayToast("Something went wrong", e, "error");
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
        console.log("Recipe successfully added");
        displayToast("Recipe successfully added", "success");
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
        displayToast("Oh snap - could not add recipe!", "error");
      }
    } catch (e) {
      displayToast("An error occurred during the request:", "error");
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
        displayToast("Recipe updated!", "success");
       } else {
        displayToast("Oh snap - could not update recipe!", "error");
      }
    } catch (e) {
      displayToast("An error occurred during the request. Please try again later.", "error");
    }
    setSelectedRecipe(null);
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const response = await fetch(`/api/recipes/${selectedRecipe.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
        setSelectedRecipe(null);
        displayToast("Recipe deleted successfully", "success");
      } else {
        displayToast("Oh snap - could not delete recipe!", "error");
      }

    } catch (e) {
      displayToast("Something went wrong during the request", e, "error");
      displayToast("An unexpected error occurred. Please try again later.", "error");
    }
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

  const updateSearchTerm = (text) => {
    setSearchTerm(text);
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

  const handleSearch = () => {
    const searchResults = recipes.filter((recipe) => {
      const valuesToSearch = [recipe.title, recipe.ingredients, recipe.description];
      //Search term will check the title, ingredients and description for the value entered. Then return a boolean value.
      return valuesToSearch.some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return searchResults;
  };

  const displayedRecipes = searchTerm ? handleSearch() : recipes;

  const displayAllRecipes = () => {
    updateSearchTerm("");
    handleUnselectRecipe();
    hideRecipeForm();
  };

  
  return (
    <div className='recipe-app'>
      <Header 
      showRecipeForm={showRecipeForm} 
      searchTerm={searchTerm} 
      updateSearchTerm={updateSearchTerm}
      displayAllRecipes={displayAllRecipes} 
      />
      {showNewRecipeForm && (
        <NewRecipeForm 
          newRecipe={newRecipe} 
          hideRecipeForm={hideRecipeForm} 
          onUpdateForm={onUpdateForm} 
          handleNewRecipe={handleNewRecipe} 
          />
    )}
    {selectedRecipe && (
      <RecipeFull 
      selectedRecipe={selectedRecipe} 
      handleUnselectRecipe={handleUnselectRecipe}
      onUpdateForm={onUpdateForm}
      handleUpdateRecipe={handleUpdateRecipe}
      handleDeleteRecipe={handleDeleteRecipe} 
      />
    )}
    {!selectedRecipe && (
      <div className="recipe-list">
      {displayedRecipes.map((recipe) => (
        <RecipeExcerpt 
        key={recipe.id} 
        recipe={recipe} 
        handleSelectRecipe={handleSelectRecipe} 
        />
        ))}
      </div>
    )}
      <ToastContainer />
    </div>
  );
}

export default App;
