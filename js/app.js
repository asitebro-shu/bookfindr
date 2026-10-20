// Utility module for handling localStorage operations wrapped in an IIFE (Immediately Invoked Function Expression)
// Ref: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
/**
 * Anticipate failures
 * An unavailable API.
 * A network connection failure.
 * A non-successful HTTP response.
 * A response containing no matching books.
 * Unexpected or incomplete JSON data.
 * 
 */
const storage = (function () {
    return {
        getAll: function() {
            const readingList = [];
            let keys = Object.keys(localStorage);
            // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
            for (const key of keys) {
                if (key.startsWith('book_')) {
                    const item = JSON.parse(localStorage.getItem(key), function(key, value) {
                        if (key === 'pageCount' && typeof value === 'string') {
                            return parseInt(value);
                        }
                        return value;
                    });
                    const bookData = { 
                        key: key,
                        value: item
                    };
                    readingList.push(bookData);
                }
            }
            return readingList;
        },
        getOne: function(key) {
            const item = JSON.parse(localStorage.getItem(key));
            return item;
        },
        put: function(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        remove: function(key) {
            localStorage.removeItem(key);
        }
    }
})();

const api = (function(apiUrl) {
    return {
        searchBooks: async function(query, limit = 10) {
            try {
                const url = new URL(apiUrl);
                url.searchParams.append('query', query);
                url.searchParams.append('page', '1');
                url.searchParams.append('limit', limit.toString());
                const response = await fetch(url.toString());
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                let result = await response.json();
                console.table(result.data); // Log the data to the console for debugging
                return result.data;
            } catch (error) {
                console.error('Error fetching books:', error);
                throw error;
            }
        },
        getRandomBook: async function() {
            try {
                const url = new URL(`${apiUrl}/book/random`);
                const response = await fetch(url.toString());
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return await response.json();
            } catch (error) {
                console.error('Error fetching random book:', error);
                throw error;
            }
        }
    };
})("https://api.freeapi.app/api/v1/public/books");


const searchForm = document.getElementById('search-form');
const resultsContainer = document.getElementById('search-results-section');

async function addToReadingList(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const bookData = {};
    formData.forEach((value, key) => {
        bookData[key] = value;
    });
    try {
        // Add a default status for the book.
        bookData['status'] = 'To Read';
        key = bookData['id'];
        console.log(bookData);
        storage.put(`book_${key}`, bookData);
        const messageElement = document.getElementById(`result-message-${key}`);
        if (messageElement) {
            setTimeout(() => {
                messageElement.textContent = '';
            }, 3000);
            messageElement.textContent = 'Book added to reading list!';
        }
    } catch (error) {
        console.error('Error adding book to reading list:', error);
        alert('Failed to add book to reading list.');
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function displayBookResults(bookList) {
    if (bookList && bookList.length > 0) {
        resultsContainer.innerHTML = '';
        const heading = document.createElement('h2');
        heading.id = 'search-results-heading';
        heading.textContent = 'Search Results';
        resultsContainer.appendChild(heading);

        bookList.forEach(book => {
            const info = book.volumeInfo;
            const authors = info.authors?.join(', ') ?? 'Author unknown';
            const title = info.title ?? 'Untitled';
            const subtitle = info.subtitle ?? '';
            const description = info.description ?? 'No description available.';
            const publishedDate = info.publishedDate ? `${new Date(info.publishedDate).getFullYear()}` : 'Publication date unavailable';
            const pageCount = info.pageCount ?? '0';
            const publisher = info.publisher ?? 'Publisher unknown';
            const categories = info.categories?.join(', ') ?? 'Uncategorized';
            const isbn = info.industryIdentifiers?.map(identifier => identifier.identifier).join(', ') ?? '';
            const resultItem = document.createElement('div');
            resultItem.classList.add('book-card');
            
            const img = document.createElement('img');
            img.src = info.imageLinks ? info.imageLinks.thumbnail : 'https://placehold.co/128x160?text=No+Image';
            img.alt = `${title} book cover thumbnail`;
            img.classList.add('book-thumbnail');
            resultItem.appendChild(img);

            const h3 = document.createElement('h3');
            h3.textContent = title;
            resultItem.appendChild(h3);
            
            const subtitleParagraph = document.createElement('p');
            subtitleParagraph.textContent = subtitle;
            resultItem.appendChild(subtitleParagraph);

            const descParagraph = document.createElement('p');
            descParagraph.textContent = description;
            resultItem.appendChild(descParagraph);

            const authorsParagraph = document.createElement('p');
            authorsParagraph.textContent = `Author: ${authors}`;
            resultItem.appendChild(authorsParagraph);

            const publishedParagraph = document.createElement('p');
            publishedParagraph.textContent = `Published: ${publishedDate}`;
            resultItem.appendChild(publishedParagraph);

            const publisherParagraph = document.createElement('p');
            publisherParagraph.textContent = `Publisher: ${publisher}`;
            resultItem.appendChild(publisherParagraph);

            const isbnParagraph = document.createElement('p');
            isbnParagraph.textContent = `ISBN: ${isbn}`;
            resultItem.appendChild(isbnParagraph);
            
            const pageCountParagraph = document.createElement('p');
            pageCountParagraph.textContent = `Length: ${pageCount} pages`;
            resultItem.appendChild(pageCountParagraph);

            const categoriesParagraph = document.createElement('p');
            categoriesParagraph.textContent = `Categories: ${categories}`;
            resultItem.appendChild(categoriesParagraph);

            const readingListForm = document.createElement('form');
            readingListForm.classList.add('add-to-reading-list-form');
            readingListForm.setAttribute('onsubmit', 'addToReadingList(event)');

            const idInput = document.createElement('input');
            idInput.setAttribute('type', 'hidden');
            idInput.setAttribute('name', 'id');
            idInput.setAttribute('value', book.id);
            readingListForm.appendChild(idInput);

            const titleInput = document.createElement('input');
            titleInput.setAttribute('type', 'hidden');
            titleInput.setAttribute('name', 'title');
            titleInput.setAttribute('value', title);
            readingListForm.appendChild(titleInput);

            const authorsInput = document.createElement('input');
            authorsInput.setAttribute('type', 'hidden');
            authorsInput.setAttribute('name', 'authors');
            authorsInput.setAttribute('value', authors);
            readingListForm.appendChild(authorsInput);

            const infoLinkInput = document.createElement('input');
            infoLinkInput.setAttribute('type', 'hidden');
            infoLinkInput.setAttribute('name', 'infoLink');
            infoLinkInput.setAttribute('value', info.infoLink);
            readingListForm.appendChild(infoLinkInput);

            const infoAnchor = document.createElement('a');
            infoAnchor.setAttribute('href', info.infoLink);
            infoAnchor.setAttribute('target', '_blank');
            infoAnchor.textContent = 'View details';
            readingListForm.appendChild(infoAnchor);

            const readingListBtn = document.createElement('button');
            readingListBtn.setAttribute('type','submit');
            readingListBtn.textContent = 'Add to reading list';
            readingListForm.appendChild(readingListBtn);
            
            const messageSpan = document.createElement('p');
            messageSpan.setAttribute('id', `result-message-${book.id}`);
            readingListForm.appendChild(messageSpan);

            resultItem.appendChild(readingListForm);

            resultsContainer.appendChild(resultItem);
            });
        } else {
            resultsContainer.innerHTML = '<p>No results found.</p>';
        }
}

// Event listener for the search form submission
// Check if the search form exists before adding the event listener
if (searchForm) {
    searchForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const loadingMessage = document.createElement('p');
        loadingMessage.textContent = 'Searching for books...';
        resultsContainer.appendChild(loadingMessage);

        const searchInput = document.querySelector('#search-query');

        const query = searchInput.value.trim();
        if (!query) {
            searchInput.focus();
            return;
        }
        resultsContainer.innerHTML = '';
        const result = await api.searchBooks(query);
        if (result) {
            displayBookResults(result.data);
        }

    });
    const surpriseButton = document.getElementById('surprise-button');
    surpriseButton.addEventListener('click', async function() {
        try {
            resultsContainer.innerHTML = '';
            const randomBook = await api.getRandomBook();
            if (randomBook) {
                displayBookResults([randomBook.data]);
            }
        } catch (error) {
            console.error('Error fetching random book:', error);
        }
    });
}

const readingListTable = document.getElementById('reading-list-table');

if (readingListTable) {
    // Load the reading list from localStorage and display it in the table
    let readingList = storage.getAll() || [];
    if (readingList.length === 0) {
        readingListTable.style.display = 'none';
    }
    else {
        readingList.forEach(item => {
            const row = readingListTable.insertRow();
            const key = item.key;
            console.log('Displaying book in reading list:', item);
            const bookData = JSON.parse(item.value);
            row.insertCell(0).textContent = bookData.title;
            row.insertCell(1).textContent = bookData.authors;
            const statusSelect = document.createElement('select');            
            ['To Read', 'Reading', 'Finished'].forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                // Set the selected option based on the book's current status
                // Ref: https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/selected
                // Ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option#selected
                if (bookData.status === status) {
                    option.selected = true;
                }
                statusSelect.appendChild(option);
            });
            statusSelect.addEventListener('change', function() {
                bookData.status = this.value;
                storage.put(key, JSON.stringify(bookData));
            });
            row.insertCell(2).appendChild(statusSelect);
            
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', function() {
                // Confirm before removing the book from the reading list 
                // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm
                if (window.confirm(`Are you sure you want to remove "${bookData.title}" from your reading list?`)) {
                        storage.remove(key);
                        readingListTable.deleteRow(row.rowIndex);
                    }
            });
            row.insertCell(3).appendChild(removeButton);
        });
    }
}