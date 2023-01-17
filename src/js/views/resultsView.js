import View from "./view.js";
import icons from 'url:../../img/icons.svg';   // Parcel 2 '
import previewView from "./previewView.js";

class ResultsView extends View {
    _parentElement = document.querySelector('.results');
    _errorMeessage = 'No recipes found for your query! Please try again ;) ';
    _successMessage = '';

    _generateMarkup() {
        // this._clear();
        return this._data.map(result => previewView.render(result, false)).join('');
    }

}
export default new ResultsView();