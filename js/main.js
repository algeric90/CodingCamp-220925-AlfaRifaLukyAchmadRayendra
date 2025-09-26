const books = [];
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "BOOKSHELF_APPS"

document.addEventListener('DOMContentLoaded', function(){
    const submit=document.getElementById('bookForm');
    submit.addEventListener('submit', function (event){
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()){
        loadDataFromStorage();
    }
});
document.addEventListener(RENDER_EVENT, function(){
    const uncompletedBookList = document.getElementById('incompleteBookList');
    uncompletedBookList.innerHTML = ``;
    
    const completedBookList = document.getElementById('completeBookList');
    completedBookList.innerHTML = ``;

    for (const bookItem of books){
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete){
            uncompletedBookList.append(bookElement)
        }else{
            completedBookList.append(bookElement)
        }
    }
});
document.addEventListener(SAVED_EVENT, function(){
    const toast = document.querySelector('#toast');
    toast.className = "show";
    setTimeout(function(){
        toast.className=toast.className.replace('show', '');
    },3000);
});
function generateId(){
    return +new Date();
}
function generateBookObject(id,title,author,year,isComplete){
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}
function addBook(){
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const Id = generateId();
    const bookObject = generateBookObject(Id,title,author,year,isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    document.getElementById('bookForm').reset();
}
function makeBook(bookObject){
    const titleBook = document.createElement('h3');
    titleBook.innerText = bookObject.title;
    titleBook.setAttribute('data-testid', 'bookItemTitle');
    const authorBook = document.createElement('p');
    authorBook.innerText = bookObject.author;
    authorBook.setAttribute('data-testid', 'bookItemAuthor')
    const yearBook = document.createElement('p');
    yearBook.innerText = bookObject.year;
    yearBook.setAttribute('data-testid', 'bookItemYear')

    const info = document.createElement('div');
    info.classList.add('booksInfo');
    info.append(titleBook,authorBook,yearBook)

    const book = document.createElement('div');
    book.classList.add('book', 'dark');
    book.setAttribute('data-bookid',`data-${bookObject.id}`);
    book.setAttribute('data-testid','bookItem');
    
    if (bookObject.isComplete){
        const btnUndo = document.createElement('button');
        btnUndo.classList.add('btn', 'btn-primary')
        btnUndo.setAttribute('data-testid','bookItemIsCompleteButton');
        btnUndo.innerHTML = `<span><i class="fa-solid fa-rotate-left"></i></span>`;

        btnUndo.addEventListener('click', function(){
            undoBookFromCompleted(bookObject.id);
        });

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('btn', 'btn-danger');
        btnDelete.setAttribute('data-testid', 'bookItemDeleteButton');
        btnDelete.innerHTML = `<span><i class="fa-solid fa-trash-can"></i></span>`;

        btnDelete.addEventListener('click', function(){
            removeBookFromList(bookObject.id);
        });

        const action = document.createElement('div');
        action.classList.add('booksAction');
        action.append(btnUndo, btnDelete);
        book.append(info,action);

    }else{
        const btnDone = document.createElement('button');
        btnDone.classList.add('btn', 'btn-success');
        btnDone.setAttribute('data-testid', 'bookItemIsCompleteButton');
        btnDone.innerHTML = `<span><i class="fa-solid fa-check-double"></i></span>`;

        btnDone.addEventListener('click', function(){
            addBookToCompleted(bookObject.id);
        });

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('btn', 'btn-danger');
        btnDelete.setAttribute('data-testid', 'bookItemDeleteButton');
        btnDelete.innerHTML = `<span><i class="fa-solid fa-trash-can"></i></span>`;

        btnDelete.addEventListener('click', function(){
            removeBookFromList(bookObject.id);
        });

        const btnEdit = document.createElement('button');
        btnEdit.classList.add('btn', 'btn-warning');
        btnEdit.setAttribute('data-testid', 'bookItemEditButton');
        btnEdit.innerHTML = `<span><i class="fa-solid fa-pen-to-square"></i></span>`;

        btnEdit.addEventListener('click', function(){
            editBook(bookObject.id);
        });

        const action = document.createElement('div');
        action.classList.add('booksAction');
        action.append(btnDone, btnDelete,btnEdit);
        book.append(info,action);
    }

    return book;
}
function addBookToCompleted(bookId){
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData();
}
function removeBookFromList(bookId){
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget,1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}
function editBook(bookId) {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    const bookElement = document.querySelector(`[data-bookid="data-${bookId}"]`);
    const titleEl = bookElement.querySelector('.booksInfo h3');
    const authorEl = bookElement.querySelector('.booksInfo p:nth-child(2)');
    const yearEl = bookElement.querySelector('.booksInfo p:nth-child(3)');

    const btnDone = bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]');
    const btnDelete = bookElement.querySelector('[data-testid="bookItemDeleteButton"]');
    const btnEdit = bookElement.querySelector('[data-testid="bookItemEditButton"]');

    // Masuk mode edit
    titleEl.contentEditable = true;
    authorEl.contentEditable = true;
    yearEl.contentEditable = true;

    btnDone.style.display = "none";
    btnDelete.style.display = "none";
    btnEdit.innerHTML = `<span><i class="fa-solid fa-floppy-disk"></i></span>`;
    btnEdit.classList.remove('btn-warning');
    btnEdit.classList.add('btn-primary');

    // Ganti handler tombol edit menjadi handler simpan
    btnEdit.onclick = function saveEdit() {
        // Simpan perubahan
        bookTarget.title = titleEl.innerText.trim();
        bookTarget.author = authorEl.innerText.trim();
        bookTarget.year = parseInt(yearEl.innerText.trim());

        // Keluar mode edit
        titleEl.contentEditable = false;
        authorEl.contentEditable = false;
        yearEl.contentEditable = false;

        btnDone.style.display = "block";
        btnDelete.style.display = "block";
        btnEdit.innerHTML = `<span><i class="fa-solid fa-pen-to-square"></i></span>`;
        btnEdit.classList.remove('btn-primary');
        btnEdit.classList.add('btn-warning');

        // Balikkan tombol edit ke fungsi aslinya
        btnEdit.onclick = () => editBook(bookId);

        // Simpan ke localStorage
        saveData();
    };
}
function undoBookFromCompleted(bookId){
    const bookTarget = findBook(bookId);

    if ( bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}
function findBook(bookId){
    for (const bookItem of books){
        if (bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}
function findBookIndex(bookId){
    for (const index in books){
        if ( books[index].id === bookId){
            return index;
        }
    }
    return -1;
}
function searchBookByTitle(){
    const search = document.getElementById('searchBook');
    search.addEventListener('click', function (event){
        event.preventDefault();
        const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
        const bookList = document.querySelectorAll('.booksInfo>h3');
        for ( const book of bookList){
            if (book.innerText.toLowerCase().includes(searchBook)){
                book.parentElement.parentElement.style.display= "block";
            }else if (searchBook !== book.innerText.toLowerCase()){
                book.parentElement.parentElement.style.display= "none";
            }else{
                book.parentElement.parentElement.style.display= "block";
            }
        }
    });
    
}
function saveData(){
    if (isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY,parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}
function isStorageExist(){
    if (typeof (Storage) === undefined){
        alert("Browser anda tidak mendukung penyimpanan local")
        return false;
    }
    return true;
}
function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null){
        for (const book of data){
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}
