import { async } from 'regenerator-runtime/runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

// State are datas stiored
export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
}

const createRecipeObject = function (recipe) {
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        ingredients: recipe.ingredients,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
    };
};

// Load recipe function
export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id.slice(1)}?key=${KEY}`);

        const { recipe } = data.data;
        state.recipe = createRecipeObject(recipe);

        // Check booked recipes and add true / false
        if (state.bookmarks.some(bookmark => bookmark.id === recipe.id))
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;


        console.log(state.recipe);
        console.log(state.bookmarks);
        // console.log(recipe.image);
    } catch (err) {
        // alert(err);
        console.log(`${err} 💥💥💥💥`);
        throw err;
    }
};


export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        console.log(data);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key }),
            };
        });
        state.search.page = 1;

    } catch (err) {
        console.error(`${err} 💥💥💥💥`)
        throw err;
    }
};


export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage;      // 0
    const end = page * state.search.resultsPerPage;      // 9;
    //console.log(start, end);
    return state.search.results.slice(start, end);
};


export const updateServings = function (newServings) {
    console.log('------ FOR UPDATE SERVINGS -------')
    console.log(state.recipe);
    state.recipe.ingredients.forEach(ing => {
        // newQt = oldQt * newServings / oldServings
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    });
    console.log(state.recipe);
    state.recipe.servings = newServings;
};


// Store bookmark in local storage
const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};


export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    //console.log(state.bookmarks);
    persistBookmarks();

};


export const deleteBookmark = function (recipe) {
    // Delete Bookmark
    const index = state.bookmarks.findIndex(el => el.id === recipe.id);
    state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmarks();
};

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
};
init();
console.log(state.bookmarks);


const clearBookmark = function () {
    localStorage.clear('bookmarks');
};
// clearBookmark();

export const uploadRecipe = async function (newRecipe) {
    try {
        // console.log(Object.entries(newRecipe));
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0]
                .startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingArr = ing[1].split(',').map(el => el.trim());
                // const ingArr = ing[1].replaceAll(' ', '').split(',');
                if (ingArr.length !== 3) {
                    throw new Error('Wrong ingredient format please use the correct format 😢');
                } else {
                    const [quantity, unit, description] = ingArr;
                    return { quantity: quantity ? +quantity : null, unit, description };
                }
            });
        console.log(ingredients);

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };
        console.log(recipe);

        // Sending JSON data
        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        console.log(data.data);
        state.recipe = createRecipeObject(data.data.recipe);
        addBookmark(state.recipe);

    } catch (err) {
        throw err;
    }
};
