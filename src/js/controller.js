import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarkView from './views/bookmarkView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// Hot module
// if (module.hot) {
//   module.hot.accept();
// }

// Fetch recipe
const controlRecipes = async function () {
  try {
    const id = window.location.hash;
    if (!id) return;
    // render spinner
    recipeView.renderSpinner();

    // 0) Update results view to marked selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarkView.update(model.state.bookmarks);

    // Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;
    console.log(recipe);

    // Rendering recipe 
    recipeView.render(recipe);


  } catch (err) {
    recipeView.renderError();
    console.error(err)
  }
};


const controlSearchResults = async function () {
  try {
    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;

    // render spinner
    resultsView.renderSpinner();

    // 2) load search results
    await model.loadSearchResults(query);

    // 3) render results to the dom
    console.log(model.state.search.results);

    // resultsView.render(model.state.search.results);
    console.log(model.getSearchResultsPage());
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);

  } catch (err) {
    console.log(err);
  }
};


// Click for button paginations
const controlPagination = function (goToPage) {
  // 1) Render result to the dom
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};


// control servings handler
const controlServings = function (newServing) {
  console.log(newServing);
  // Update the recipe servings (in state)
  model.updateServings(newServing);

  // Update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

};


// Add new bookmark
const controlAddBookmark = function () {
  // Add or Remove bookmarks
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe);
  }

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

// Get form recepi data
const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    // Loading spinner
    addRecipeView.renderSpinner();
    console.log(newRecipe);
    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    // // Render recipe
    recipeView.render(model.state.recipe);

    // Display success message
    addRecipeView.renderMessage();

    // Render bookmark
    bookmarkView.render(model.state.bookmarks);

    // Change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();

      // Render form
      setTimeout(function () {
        addRecipeView.render(['form']);
      }, 1 * 1000)

    }, MODAL_CLOSE_SEC * 1000);

  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }

};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  //controlServings();

};
init();






