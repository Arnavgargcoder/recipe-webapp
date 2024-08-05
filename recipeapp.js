const searchBox = document.querySelector('.searchBox');
const searchBtn = document.querySelector('.searchBtn');
const recipeContainer = document.querySelector('.recipe-container');
const recipeDetailsContent = document.querySelector('.recipe-details-content');
const recipeCloseBtn = document.querySelector('.recipe-close-btn');
const favoriteRecipesContainer = document.querySelector('.favorite-recipes-container');
const spinner = document.querySelector('.spinner');
const favoriteBtn = document.querySelector('.favorite');
const favoritePopup = document.querySelector('.favorite-popup');
const favoritePopupCloseBtn = document.querySelector('.favorite-popup-close-btn');

// Function to show the spinner
const showSpinner = () => {
    spinner.style.display = "block";
};

// Function to hide the spinner
const hideSpinner = () => {
    spinner.style.display = "none";
};

// Function to get recipe
const fetchRecipe = async (query) => {
    showSpinner();
    recipeContainer.innerHTML = "<h2>Fetching Recipe...</h2>";
    try {
        const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const response = await data.json();
        hideSpinner();

        if (response.meals) {
            recipeContainer.innerHTML = "";
            response.meals.forEach(meal => {
                const recipeDiv = document.createElement('div');
                recipeDiv.classList.add('recipe');
                recipeDiv.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <h3>${meal.strMeal}</h3>
                    <p><span>${meal.strArea}</span> Dish</p>
                    <p>Belongs To <span>${meal.strCategory}</span> Category</p>
                `;

                // Favorite button
                const favoriteButton = document.createElement('button');
                favoriteButton.textContent = "Add to Favorites";
                favoriteButton.classList.add('colorful-button');
                favoriteButton.addEventListener('click', () => saveToFavorites(meal));
                recipeDiv.appendChild(favoriteButton);

                const button = document.createElement('button');
                button.textContent = "View Recipe";
                button.classList.add('colorful-button'); // Add class for colorful effect
                recipeDiv.appendChild(button);

                button.addEventListener('click', () => {
                    openRecipePopup(meal);
                });

                recipeContainer.appendChild(recipeDiv);
            });
        } else {
            recipeContainer.innerHTML = "<h2>No recipes found.</h2>";
        }
    } catch (error) {
        hideSpinner();
        recipeContainer.innerHTML = "<h2>Failed to fetch recipes. Please try again later.</h2>";
        console.error('Error fetching recipes:', error);
    }
};

// Function to open recipe popup
const openRecipePopup = (meal) => {
    // Extract YouTube video ID from meal.strYoutube
    const videoId = meal.strYoutube.split('v=')[1];
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    recipeDetailsContent.innerHTML = `
    <h2 class="recipename">${meal.strMeal}</h2>
    <h3>Ingredients</h3>
    <ul class="ingredientlist">${fetchIngredients(meal)}</ul>
    <div id="imgset">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal};">
    </div>
    <div id="insset">
        <h3>Instructions</h3>
        <p class="recipeInstruction">${meal.strInstructions}</p>
    </div>
    <iframe id="videoset" width="600" height="400" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
    `;
    recipeDetailsContent.parentElement.style.display = "block";
};

// Function to fetch ingredients and measurements
const fetchIngredients = (meal) => {
    let ingredientList = "";
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        if (ingredient) {
            const measure = meal[`strMeasure${i}`];
            ingredientList += `<li>${measure} ${ingredient}</li>`;
        } else {
            break;
        }
    }
    return ingredientList;
};

// Function to close recipe popup
recipeCloseBtn.addEventListener('click', () => {
    recipeDetailsContent.parentElement.style.display = "none";
});

// Function to show favorite recipes popup
const showFavoritePopup = () => {
    favoritePopup.style.display = "block";
    displayFavoriteRecipes();
};

// Function to close favorite recipes popup
favoritePopupCloseBtn.addEventListener('click', () => {
    favoritePopup.style.display = "none";
});

// Event listener for search button click
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const searchInput = searchBox.value.trim();
    if (searchInput) {
        fetchRecipe(searchInput);
    } else {
        recipeContainer.innerHTML = "<h2>Please enter a search term.</h2>";
    }
});

favoriteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showFavoritePopup();
});

// Function to save recipe to local storage
const saveToFavorites = (meal) => {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push(meal);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavoriteRecipes();
};

// Function to display favorite recipes
const displayFavoriteRecipes = () => {
    favoriteRecipesContainer.innerHTML = "";
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(meal => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
            <p><span>${meal.strArea}</span> Dish</p>
            <p>Belongs To <span>${meal.strCategory}</span> Category</p>
        `;
        const button1 = document.createElement('button');
        button1.textContent = "View Recipe";
        button1.classList.add('colorful-button'); // Add class for colorful effect
        recipeDiv.appendChild(button1);

        button1.addEventListener('click', () => {
            openRecipePopup(meal);
            favoritePopup.style.display="none"
        });
        const button = document.createElement('button');
        button.textContent = "Remove from Favorites";
        button.classList.add('colorful-button');
        recipeDiv.appendChild(button);

        button.addEventListener('click', () => {
            removeFromFavorites(meal.idMeal);
        });

        favoriteRecipesContainer.appendChild(recipeDiv);
    });
};

// Function to remove recipe from favorites
const removeFromFavorites = (id) => {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(meal => meal.idMeal !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavoriteRecipes();
};

// Call displayFavoriteRecipes on page load to show any saved favorites
displayFavoriteRecipes();
