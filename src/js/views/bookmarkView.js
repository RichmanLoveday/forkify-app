import View from "./view.js";
import icons from 'url:../../img/icons.svg';   // Parcel 2 '
import previewView from "./previewView.js";

class BookmarkView extends View {
    _parentElement = document.querySelector('.bookmarks__list');
    _errorMeessage = 'No bookmarks yet. Find a nice recipe and bookmark it 😉';
    _successMessage = '';

    addHandlerRender(handler) {
        window.addEventListener('load', handler);
    }

    _generateMarkup() {
        // this._clear();
        return this._data.map(bookmark => previewView.render(bookmark, false)).join('');
    }

}
export default new BookmarkView();